import { useEffect } from 'react';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GenericElements } from 'Components/GenericElements';
import { HomeClientsItem } from 'Components/Items/HomeClientsItem';
import { useGetHomeClientsListQuery } from 'Redux/api/clients';
import { IClient } from 'Redux/apiInterfaces';
import { Link, useNavigate } from 'react-router-dom';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import styles from './clientswidget.module.sass';

export function ClientsWidget() {
  const authState = useAppSelector(state => state.auth)
  
  const {data, isLoading, isSuccess, isError, error, refetch} = useGetHomeClientsListQuery(authState.authUserRoleId === 1 
    ? {mode: 'byManager', id: authState.authUserId || 1}
    : {mode: 'all'}
  )

  const [signout] = useSignoutMutation()
  const [refresh] = useLazyRefreshQuery()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
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
    <section className={styles.clientswidget}>
      <div className={styles.container}>
        <div className={styles.clientswidget__titleWrapper}>
          <h2 className={styles.clientswidget__title}>Новые клиенты</h2>
          <Link to='/clients' className={styles.clientswidget__goToPageLink}>
            Посмотреть всех
            <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>
        {isLoading &&
          <p className={styles.clientswidget__msg}>Загрузка...</p>
        }
        {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
          <p className={styles.clientswidget__msg}>Обновляем Access токен. Повторно получаем данные для этого виджета.</p>
        }
        {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
          <p className={styles.clientswidget__msg}>Не получилось загрузить данные для этого виджета</p>
        }
        {isSuccess && data && 'items' in data &&
          <ul className={styles.clientswidget__list}>
            <GenericElements<IClient> list={data.items} Template={HomeClientsItem}/>
          </ul>
        }
      </div>
    </section>
  );
}