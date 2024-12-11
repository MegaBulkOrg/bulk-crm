import { useEffect } from 'react';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import crmLogo from '/img/crm_logo.png';
import noAvatar from '/img/no_avatar.png';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { useGetCurrentUserQuery } from 'Redux/api/users';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { tokenErrorHandler } from "../../helpers/tokenErrorHandler";
import { useNavigate } from 'react-router-dom';
import styles from './mobileheaderpanel.module.sass';

export function MobileHeaderPanel() {
  const dispatch = useAppDispatch()
  
  function modalOpen(name: string) {
    dispatch(
      modalSwitch({open: true, modalName: name, itemId: null})
    )
  }

  const authUserId = useAppSelector(state => state.auth.authUserId)
  const { data:userInfo, isSuccess:isUserInfoSuccess, isError:isUserInfoError, error:userInfoError, refetch:userInfoRefetch } = useGetCurrentUserQuery(authUserId || 0)

  const [signout] = useSignoutMutation()
  const [refresh] = useLazyRefreshQuery()
  const navigate = useNavigate()
  useEffect(() => {
    async function tokenError() {    
      if (isUserInfoError && 'status' in userInfoError && (userInfoError.status === 401 || userInfoError.status === 403)) {
        const response = await tokenErrorHandler({error: userInfoError, dispatch, signout, authUserId, refresh})
        response ? userInfoRefetch() : navigate('/login')
      }
    }
    tokenError()
  }, [isUserInfoError, userInfoError])

  return (
    <div className={styles.mPanel}>
      <img className={styles.mPanel__logo} src={crmLogo} alt='БулькCRM' onClick={() => modalOpen('mobileSidebar')} />
      <div className={styles.mPanel__right}>
        <FontAwesomeIcon icon={faMagnifyingGlass} onClick={() => modalOpen('mobileSearch')} />
        {/* notifications icon */}
        {isUserInfoSuccess && 'id' in userInfo &&
          <img className={styles.mPanel__meAvatar} src={userInfo.avatar 
            ? `http://${import.meta.env.VITE_REACT_APP_HOST}:${import.meta.env.VITE_REACT_API_PORT}/api/files/get-img/users/${userInfo.avatar}` 
            : noAvatar} 
          alt={userInfo.name} />
        }
      </div>
    </div>
  );
}