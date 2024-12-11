import { useEffect } from "react";
import { useGetCurrentUserQuery } from "Redux/api/users";
import { useLocation, useNavigate } from "react-router-dom";
import { UserLists } from "Components/UserPage/UserLists";
import { UserPersonalInfo } from "Components/UserPage/UserPersonalInfo";
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { tokenErrorHandler } from "../../helpers/tokenErrorHandler";
import { useLazyRefreshQuery, useSignoutMutation } from "Redux/api/auth";
import styles from './user.module.sass';

export function User() {
  const authStatus = useAppSelector(state => state.auth.isAuth)  
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.pathname.slice(7)
  const { data, isLoading, isSuccess, isError, error, refetch } = useGetCurrentUserQuery(Number(userId))
  
  useEffect(() => {
    if (authStatus) {    
      if (isSuccess && !('msg' in data) && !data.id) navigate('/404')
      const h1 = document.querySelector('h1')
      if (h1 !== null && data && 'name' in data) h1.textContent = data.name || 'Сотрудник'
      if (data) {
        'name' in data 
          ? document.title = `${data.name} - БулькCRM`
          : document.title = 'Сотрудник - БулькCRM'
      }
    } else {
      navigate('/login')
    }
  }, [data])

  const dispatch = useAppDispatch()
  const [signout] = useSignoutMutation()
  const authUserId = useAppSelector(state => state.auth.authUserId)
  const [refresh] = useLazyRefreshQuery()
  useEffect(() => {
    async function tokenError() {    
        if (isError && 'status' in error && (error.status === 401 || error.status === 403)) {
            const response = await tokenErrorHandler({error, dispatch, signout, authUserId, refresh})
            response ? refetch() : navigate('/login')
        }
    }
    tokenError()
}, [isError, error])

  return (
    <section className={styles.user}>
      <div className={styles.container}>
        {isLoading && <p className={styles.user__msg}>Загрузка...</p>}
        {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
          <p className={styles.user__msg}>Обновляем Access токен. Повторно получаем данные пользователя.</p>
        }
        {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
          <p className={styles.user__msg}>Не получилось загрузить данные пользователя</p>
        }
        {isSuccess && 'id' in data &&
          <>
            <UserPersonalInfo user={data}  />
            <UserLists aboutText={data.description} role={data.role} />
          </>
        }
      </div>
    </section>
  );
}