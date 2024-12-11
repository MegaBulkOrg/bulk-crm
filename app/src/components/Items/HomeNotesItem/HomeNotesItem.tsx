import { useEffect } from 'react';
import { useGetCurrentDealQuery } from 'Redux/api/deals';
import { useGetCurrentClientQuery } from 'Redux/api/clients';
import { INote } from 'Redux/apiInterfaces';
import DOMPurify from 'dompurify';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { useNavigate } from 'react-router-dom';
import { tokenErrorHandler } from "../../../helpers/tokenErrorHandler";
import styles from './homenotesitem.module.sass';

export function HomeNotesItem(props:INote) {  
  const shortContent = props.content.slice(0, 157);
  let safeContent = '';
  if (shortContent.endsWith('</p>')) {
    safeContent = DOMPurify.sanitize(shortContent);
  } else {
    safeContent = DOMPurify.sanitize(shortContent+' ...</p>');
  }

  const {data: deal, isError: isDealError, error: dealError, refetch: refetchDeal} = useGetCurrentDealQuery(props.id_deal)
  const {data: client, isSuccess: isClientSuccess, isError: isClientError, error: clientError, refetch: refetchClient} = useGetCurrentClientQuery(deal && 'id' in deal ? deal.id_client : 1)

  const [signout] = useSignoutMutation()
  const [refresh] = useLazyRefreshQuery()
  const authUserId = useAppSelector(state => state.auth.authUserId)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  useEffect(() => {
    async function tokenError() {
      if (isDealError && 'status' in dealError && (dealError.status === 401 || dealError.status === 403)) {
        const response = await tokenErrorHandler({error:dealError, dispatch, signout, authUserId, refresh})
        response ? refetchDeal() : navigate('/login')
      }
      if (isClientError && 'status' in clientError && (clientError.status === 401 || clientError.status === 403)) {
        const response = await tokenErrorHandler({error:clientError, dispatch, signout, authUserId, refresh})
        response ? refetchClient() : navigate('/login')
    }
    }
    tokenError()
  }, [
    isDealError, dealError,
    isClientError, clientError
  ])

  return (
    <li className={styles.item} key={props.id} 
      onClick={() => dispatch(modalSwitch({open: true, modalName: 'noteFullInfo', itemId: props.id}))}
    >
      <div className={styles.item__up}>
        <span className={styles.item__title}>{props.title}</span>
        {isClientSuccess && 'id' in client &&
          <span className={styles.item__subtitle}>{client.title}</span>
        }
      </div>
      <div className={styles.item__textWrapper} dangerouslySetInnerHTML={{ __html: safeContent }} />
    </li>
  );
}