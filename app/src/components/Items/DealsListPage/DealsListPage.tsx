import { useEffect } from 'react';
import { faIndianRupee, faDollar, faEuro, faRmb, faRub } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGetCurrentClientQuery } from 'Redux/api/clients';
import { IDeal } from 'Redux/apiInterfaces';
import { Link, useNavigate } from 'react-router-dom';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import { tzDateStringToCommonDateString } from '../../../helpers/date';
import styles from './dealslistpage.module.sass';

export function DealsListPage(props:IDeal) {    
  let itemClass = ''
  if (props.status.id === 1 || props.status.id === 2 || props.status.id === 3) itemClass = `${styles.item} ${styles.item__inWork}`
  if (props.status.id === 4) itemClass = `${styles.item} ${styles.item__done}`
  if (props.status.id === 5) itemClass = `${styles.item} ${styles.item__canceled}`

  const {data: client, isSuccess: isClientSuccess, isError: isClientError, error: clientError, refetch: refetchClient} = useGetCurrentClientQuery(props.id_client);
  
  const [signout] = useSignoutMutation()
  const [refresh] = useLazyRefreshQuery()
  const authUserId = useAppSelector(state => state.auth.authUserId)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  useEffect(() => {
    async function tokenError() {
      if (isClientError && 'status' in clientError && (clientError.status === 401 || clientError.status === 403)) {
          const response = await tokenErrorHandler({error:clientError, dispatch, signout, authUserId, refresh})
          response ? refetchClient() : navigate('/login')
      }      
    }
    tokenError()
  }, [isClientError, clientError])

  return (
    <div className={itemClass} key={props.id}>
      <Link to={`/deals/${props.id}`}>        
        <div className={styles.item__itemWrapper}>
          <div className={styles.item__titleWrapper}>
            <h3 className={styles.item__title}>{props.title}</h3>
            {isClientSuccess && 'id' in client &&
              <h3 className={styles.item__title}>({client.title})</h3>
            }
          </div>
          {/* arrow icon */}
          <div className={styles.item__down}>
            <span className={styles.item__date}>{tzDateStringToCommonDateString(props.beginning_date)}</span>
            <div className={styles.item__sum}>
              {props.currency.code === 'RUB' && <FontAwesomeIcon icon={faRub} />}
              {props.currency.code === 'CNY' && <FontAwesomeIcon icon={faRmb} />}
              {props.currency.code === 'EUR' && <FontAwesomeIcon icon={faEuro} />}
              {props.currency.code === 'USD' && <FontAwesomeIcon icon={faDollar} />}
              {props.currency.code === 'INR' && <FontAwesomeIcon icon={faIndianRupee} />}
              {props.sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}