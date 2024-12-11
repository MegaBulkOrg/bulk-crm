import { useGetCurrentClientQuery } from "Redux/api/clients";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClientInfo } from "Components/ClientPage/ClientInfo";
import { ClientDealsList } from "Components/ClientPage/ClientDealsList";
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useLazyRefreshQuery, useSignoutMutation } from "Redux/api/auth";
import { tokenErrorHandler } from "../../helpers/tokenErrorHandler";
import styles from './client.module.sass';

export function Client() {
  const authState = useAppSelector(state => state.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const clientId = location.pathname.slice(9)
  const { data, isLoading, isSuccess, isError, error, refetch } = useGetCurrentClientQuery(Number(clientId))

  useEffect(() => {
    if (authState.isAuth) {          
      if (isSuccess && !('msg' in data)) {
        if (!data.id) navigate('/404')
        if (data.id && authState.authUserRoleId === 1 && data.id_user !== authState.authUserId) navigate('/401')
      }
      const h1 = document.querySelector('h1')
      if (h1 !== null && data && 'title' in data) h1.textContent = data.title || 'Клиент'
      if (data) {
        'title' in data 
          ? document.title = `${data.title} - БулькCRM`
          : document.title = 'Клиент - БулькCRM'
      }
    } else {
      navigate('/login')
    }
  }, [data])

  const dispatch = useAppDispatch()
  const [signout] = useSignoutMutation()
  const [refresh] = useLazyRefreshQuery()
  useEffect(() => {
    async function tokenError() {    
        if (isError && 'status' in error && (error.status === 401 || error.status === 403)) {
            const response = await tokenErrorHandler({error, dispatch, signout, authUserId:authState.authUserId, refresh})
            response ? refetch() : navigate('/login')
        }
    }
    tokenError()
  }, [isError, error])

  return (
    <section className={styles.client}>
      <div className={styles.container}>
        {isLoading && <p className={styles.client__msg}>Загрузка...</p>}
        {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
          <p className={styles.client__msg}>Обновляем Access токен. Повторно получаем данные клиента.</p>
        }
        {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
          <p className={styles.client__msg}>Не получилось загрузить данные клиента</p>
        }
        {isSuccess && 'id' in data &&
          <>
            <ClientInfo client={data}  />
            <ClientDealsList aboutText={data.description} />
          </>
        }
      </div>
    </section>
  );
}