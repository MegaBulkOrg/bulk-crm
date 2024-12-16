import { useEffect } from 'react';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import noAvatar from '/img/no_avatar.png';
import noLogo from '/img/no_photo.png';
import { useСountDealsDoneQuery, useСountDealsInWorkQuery } from 'Redux/api/deals';
import { useGetCurrentUserQuery } from 'Redux/api/users';
import { IClient } from 'Redux/apiInterfaces';
import { Link, useNavigate } from 'react-router-dom';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import { tzDateStringToCommonDateString } from '../../../helpers/date';
import { dbPhoneFormatting } from '../../../helpers/phone';
import styles from './homeclientsitem.module.sass';

export function HomeClientsItem(props:IClient) {  
  let itemTypeClass = ``
  if (props.type === 'Юр. лица' || props.type === 'Заграница' || props.type === 'Госструктуры') itemTypeClass = `${styles.item__type} ${styles.item__org}`
  if (props.type === 'Физ. лица' || props.type === 'ИП') itemTypeClass = `${styles.item__type} ${styles.item__ind}`

  const {data: user, isSuccess: isUserSuccess, isError: isUserError, error: userError, refetch: refetchUser} = useGetCurrentUserQuery(props.id_user);
    
  const {data: dealsInWork, isSuccess: isDealsInWorkSuccess, isError: isDealsInWorkError, error: dealsInWorkError, refetch: refetchDealsInWork} = useСountDealsInWorkQuery(props.id);
  const {data: dealsDone, isSuccess: isDealsDoneSuccess, isError: isDealsDoneError, error: dealsDoneError, refetch: refetchDealsDone} = useСountDealsDoneQuery(props.id);

  const [signout] = useSignoutMutation()
  const [refresh] = useLazyRefreshQuery()
  const authUserId = useAppSelector(state => state.auth.authUserId)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  useEffect(() => {
      async function tokenError() {
        if (isUserError && 'status' in userError && (userError.status === 401 || userError.status === 403)) {
            const response = await tokenErrorHandler({error:userError, dispatch, signout, authUserId, refresh})
            response ? refetchUser() : navigate('/login')
        }      
        if (isDealsInWorkError && 'status' in dealsInWorkError && (dealsInWorkError.status === 401 || dealsInWorkError.status === 403)) {
            const response = await tokenErrorHandler({error:dealsInWorkError, dispatch, signout, authUserId, refresh})
            response ? refetchDealsInWork() : navigate('/login')
        }
        if (isDealsDoneError && 'status' in dealsDoneError && (dealsDoneError.status === 401 || dealsDoneError.status === 403)) {
          const response = await tokenErrorHandler({error:dealsDoneError, dispatch, signout, authUserId, refresh})
          response ? refetchDealsDone() : navigate('/login')
        }
      }
      tokenError()
  }, [isUserError, userError, isDealsInWorkError, dealsInWorkError, isDealsDoneError, dealsDoneError])

  return (
    <li className={styles.item}>
      <Link className={styles.item__left} to={`/clients/${props.id}`}>
        <div className={styles.item__leftUp}>
          <img className={styles.item__logo} src={props.logo 
            ? `${import.meta.env.VITE_REACT_APP_HOST}/api/files/get-img/clients/${props.logo}` 
            : noLogo} 
          alt={props.title} />
          <div className={styles.item__titleWrapper}>
            <span className={styles.item__contact}>{dbPhoneFormatting(props.phone)}</span>
            <h3 className={styles.item__title}>{props.title}</h3>
          </div>
        </div>
        <div className={styles.item__leftDown}>
          <div className={styles.item__date}>
            <FontAwesomeIcon icon={faCalendar}/>
            Дата лида: {tzDateStringToCommonDateString(props.lead_date)}
          </div>
          <span className={itemTypeClass}>{props.type}</span>
        </div>
      </Link>      
      <div className={styles.item__right}>
        <h4 className={styles.item__rightTitle}>Информация по сделкам</h4>
        <div className={styles.item__info}>
          <span className={styles.item__infoTitle}>Готовые</span>
          <span className={styles.item__infoTitle}>В работе</span>
          <span className={styles.item__infoTitle}>Менеджер клиента</span>
          {isDealsInWorkSuccess && dealsDone && 'quantity' in dealsDone &&
            <span className={styles.item__infoValue}>{dealsDone?.quantity}</span>
          }
          {isDealsDoneSuccess && dealsInWork && 'quantity' in dealsInWork &&
            <span className={styles.item__infoValue}>{dealsInWork?.quantity}</span>
          }
          {isUserSuccess && 'id' in user &&
            <Link to={`/users/${props.id_user}`}>
              <img className={styles.item__user} src={user.avatar 
                ? `${import.meta.env.VITE_REACT_APP_HOST}/api/files/get-img/users/${user.avatar}` 
                : noAvatar} 
              alt={user?.name} />
            </Link>
          }
        </div>
      </div>
    </li>
  );
}