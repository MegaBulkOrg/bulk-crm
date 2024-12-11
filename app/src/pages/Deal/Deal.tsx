import { useGetCurrentDealQuery } from "Redux/api/deals";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DealInfo } from "Components/DealPage/DealInfo";
import { DealNotesList } from "Components/DealPage/DealNotesList";
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useLazyRefreshQuery, useSignoutMutation } from "Redux/api/auth";
import { tokenErrorHandler } from "../../helpers/tokenErrorHandler";
import { useGetCurrentClientQuery } from "Redux/api/clients";
import styles from './deal.module.sass';

export function Deal() {
  const authState = useAppSelector(state => state.auth)
  const navigate = useNavigate();
  const location = useLocation();
  const dealId = location.pathname.slice(7);
  const { data, isLoading, isSuccess, isError, error, refetch } = useGetCurrentDealQuery(Number(dealId))
  const {data: client, isSuccess: isClientSuccess, isError: isClientError, error: clientError, refetch: refetchClient} = useGetCurrentClientQuery(data && 'id' in data ? data.id_client : 1)

  useEffect(() => {
    if (authState.isAuth) {
      if (isSuccess && !('msg' in data)) {
        if(!data.id) navigate('/404')
        if (data.id && authState.authUserRoleId === 1 && client && 'id' in client && client.id_user !== authState.authUserId) navigate('/401') 
      }
      const h1 = document.querySelector('h1')
      if (h1 !== null && data && 'title' in data) h1.textContent = data.title || 'Сделка'
      if (data) {
        'title' in data 
          ? document.title = `${data.title} - БулькCRM`
          : document.title = 'Сделка - БулькCRM'
      }
    } else {
      navigate('/login')
    }
  }, [data, isClientSuccess])

  const dispatch = useAppDispatch()
  const [signout] = useSignoutMutation()
  const [refresh] = useLazyRefreshQuery()
  useEffect(() => {    
    async function tokenError() {    
      if (isClientError && 'status' in clientError && (clientError.status === 401 || clientError.status === 403)) {
        const response = await tokenErrorHandler({error:clientError, dispatch, signout, authUserId:authState.authUserId, refresh})
        response ? refetchClient() : navigate('/login')
      }
      if (isError && 'status' in error && (error.status === 401 || error.status === 403)) {
          const response = await tokenErrorHandler({error, dispatch, signout, authUserId:authState.authUserId, refresh})
          response ? refetch() : navigate('/login')
      }
    }
    tokenError()
  }, [isError, error])

  return (
    <section className={styles.deal}>
      <div className={styles.container}>
        {isLoading && <p className={styles.deal__msg}>Загрузка...</p>}
        {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
          <p className={styles.deal__msg}>Обновляем Access токен. Повторно получаем данные сделки.</p>
        }
        {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
          <p className={styles.deal__msg}>Не получилось загрузить данные сделки</p>
        }
        {isSuccess && 'id' in data &&
          <>
            <DealInfo deal={data}  />
            <DealNotesList aboutText={data.description} />
          </>
        }
      </div>
    </section>
  );
}