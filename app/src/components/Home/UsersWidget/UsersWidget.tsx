import { useEffect } from 'react';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GenericElements } from 'Components/GenericElements';
import { HomeUsersItem } from 'Components/Items/HomeUsersItem';
import { useGetHomeUsersListQuery } from 'Redux/api/users';
import { IUser } from 'Redux/apiInterfaces';
import { Link, useNavigate } from 'react-router-dom';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import styles from './userswidget.module.sass';

export function UsersWidget() {
  const {data = [], isLoading, isSuccess, isError, error, refetch} = useGetHomeUsersListQuery();  
  
  const dispatch = useAppDispatch()
  const [signout] = useSignoutMutation()
  const authUserId = useAppSelector(state => state.auth.authUserId)
  const [refresh] = useLazyRefreshQuery()
  const navigate = useNavigate()
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
    <section className={styles.userswidget}>
      <div className={styles.container}>
        <div className={styles.userswidget__titleWrapper}>
          <h2 className={styles.userswidget__title}>Наши менеджеры</h2>
          <Link to='/users' className={styles.userswidget__goToPageLink}>
            Посмотреть всех
            <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>
        {isLoading && <p className={styles.userswidget__msg}>Загрузка...</p>}
        {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
          <p className={styles.userswidget__msg}>Обновляем Access токен. Повторно получаем данные для этого виджета.</p>
        }
        {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
          <p className={styles.userswidget__msg}>Не получилось загрузить данные для этого виджета</p>
        }
        {isSuccess && Array.isArray(data) &&
          <ul className={styles.userswidget__list}>
            <GenericElements<IUser> list={data} Template={HomeUsersItem}/>
          </ul>
        }
      </div>
    </section>
  );
}