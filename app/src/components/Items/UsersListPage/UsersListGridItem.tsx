import { useEffect } from 'react';
import noAvatar from '/img/no_avatar.png';
import { useСountDealsDoneByCurrentUserQuery, useСountDealsFailedByCurrentUserQuery, useСountDealsInWorkByCurrentUserQuery } from 'Redux/api/deals';
import { IUser } from "Redux/apiInterfaces";
import { Link, useNavigate } from 'react-router-dom';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import styles from './userslistpageitem.module.sass';

export function UsersListGridItem(props:IUser) {  
  const {data: dealsInWork, isSuccess: isDealsInWorkSuccess, isError: isDealsInWorkError, error: dealsInWorkError, refetch: refetchDealsInWork} = useСountDealsInWorkByCurrentUserQuery(props.id)
  const {data: dealsDone, isSuccess: isDealsDoneSuccess, isError: isDealsDoneError, error: dealsDoneError, refetch: refetchDealsDone} = useСountDealsDoneByCurrentUserQuery(props.id)
  const {data: dealsFailed, isSuccess: isDealsFailedSuccess, isError: isDealsFailedError, error: dealsFailedError, refetch: refetchDealsFailed} = useСountDealsFailedByCurrentUserQuery(props.id)
  
  const [signout] = useSignoutMutation()
  const [refresh] = useLazyRefreshQuery()
  const authUserId = useAppSelector(state => state.auth.authUserId)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  useEffect(() => {
      async function tokenError() {    
        if (isDealsInWorkError && 'status' in dealsInWorkError && (dealsInWorkError.status === 401 || dealsInWorkError.status === 403)) {
            const response = await tokenErrorHandler({error:dealsInWorkError, dispatch, signout, authUserId, refresh})
            response ? refetchDealsInWork() : navigate('/login')
        }
        if (isDealsDoneError && 'status' in dealsDoneError && (dealsDoneError.status === 401 || dealsDoneError.status === 403)) {
          const response = await tokenErrorHandler({error:dealsDoneError, dispatch, signout, authUserId, refresh})
          response ? refetchDealsDone() : navigate('/login')
        }
        if (isDealsFailedError && 'status' in dealsFailedError && (dealsFailedError.status === 401 || dealsFailedError.status === 403)) {
          const response = await tokenErrorHandler({error:dealsFailedError, dispatch, signout, authUserId, refresh})
          response ? refetchDealsFailed() : navigate('/login')
        }
      }
      tokenError()
  }, [isDealsInWorkError, dealsInWorkError, isDealsDoneError, dealsDoneError, isDealsFailedError, dealsFailedError])

  return (
    <div className={styles.gridItem} key={props.id}>
      <Link to={`/users/${props.id}`}>
        <div className={styles.gridItem__wrapper}>
          <div className={styles.gridItem__up}>
            <div className={styles.gridItem__up__container}>
              <div className={styles.gridItem__up__imgWrapper}>
                <img className={styles.gridItem__up__img} src={props.avatar 
                  ? `http://${import.meta.env.VITE_REACT_APP_HOST}:${import.meta.env.VITE_REACT_API_PORT}/api/files/get-img/users/${props.avatar}` 
                  : noAvatar} 
                alt={props.name} />
              </div>
              <p className={styles.gridItem__up__name}>{props.name}</p>
              {props.job && <p className={styles.gridItem__up__job}>{props.job}</p>}
            </div>
            {props.specialization && props.specialization !== 'Отсутствует' &&
              <span className={styles.gridItem__up__specialization}>{props.specialization}</span>
            }
          </div>
          {props.role === 'manager' &&    
            <div className={styles.gridItem__down}>
              <div className={styles.gridItem__down__indicator}>
                {isDealsInWorkSuccess && 'quantity' in dealsInWork &&
                  <div className={styles.gridItem__down__indicator__value}>{dealsInWork.quantity}</div>
                }
                <div className={styles.gridItem__down__indicator__title}>В работе</div>
              </div>
              <div className={styles.gridItem__down__indicator}>
                {isDealsDoneSuccess && 'quantity' in dealsDone &&
                  <div className={styles.gridItem__down__indicator__value}>{dealsDone.quantity}</div>
                }
                <div className={styles.gridItem__down__indicator__title}>Готовые</div>
              </div>
              <div className={styles.gridItem__down__indicator}>
                {isDealsFailedSuccess && 'quantity' in dealsFailed &&
                  <div className={styles.gridItem__down__indicator__value}>{dealsFailed.quantity}</div>
                }
                <div className={styles.gridItem__down__indicator__title}>Отказы</div>
              </div>
            </div>
          }
        </div>
      </Link>
    </div>
  );
}