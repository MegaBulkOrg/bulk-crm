import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuromobelexperte } from '@fortawesome/free-brands-svg-icons';
import { faArrowRightFromBracket, faBuildingColumns, faFolderOpen, faPeopleGroup, faHurricane, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import crmLogo from '/img/crm_logo.png';
import megabulkLogo from '/img/megabulk_logo.png';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { resetAuthStatus } from 'Redux/slices/authSlice';
import { Link, useLocation } from 'react-router-dom';
import { useSignoutMutation } from 'Redux/api/auth';
import { useNavigate } from 'react-router-dom';
import { ISignoutResponse } from 'Redux/apiInterfaces';
import styles from './sidebar.module.sass';

export function Sidebar() {  
  const location = useLocation();

  const dispatch = useAppDispatch()

  function modalClose() {
      dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
  }

  const [signout, {isLoading: isSignoutLoading, isSuccess: isSignoutSuccess}] = useSignoutMutation()
  const navigate = useNavigate()

  const [response, setResponse] = useState<ISignoutResponse>({status: false, msg: ''})

  const authUserId = useAppSelector(state => state.auth.authUserId)
  async function logout() {
    const { data } = await signout(authUserId || 0)
    if (data) setResponse(data)
  }

  useEffect(() => {
    if (isSignoutSuccess && response.status) {
      modalClose()
      dispatch(resetAuthStatus())
      navigate('/login')
    }
  },[isSignoutSuccess, response])

  function addUser() {
    dispatch(modalSwitch({open: true, modalName: 'addUser', itemId: null}))
  }

  const authUserRoleId = useAppSelector(state => state.auth.authUserRoleId)

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__up}>
        <Link to='/' onClick={modalClose}>
          <img className={styles.sidebar__logo} src={crmLogo} alt='БулькCRM' />
        </Link>
        <ul className={styles.sidebar__menu}>
          <li className={styles.sidebar__menuItem}>
            <Link to='/' className={location.pathname === '/' ? `${styles.sidebar__menuItemLink} ${styles.sidebar__menuItemLinkActive}` : styles.sidebar__menuItemLink} onClick={modalClose}>
              <FontAwesomeIcon icon={faBuromobelexperte} />
              Главная
            </Link>
          </li>
          <li className={styles.sidebar__menuItem}>
            <Link to='/users' className={location.pathname === '/users' ? `${styles.sidebar__menuItemLink} ${styles.sidebar__menuItemLinkActive}` : styles.sidebar__menuItemLink} onClick={modalClose}>
              <FontAwesomeIcon icon={faPeopleGroup} />
              Сотрудники
            </Link>
          </li>
          <li className={styles.sidebar__menuItem}>
            <Link to='/clients' className={location.pathname === '/clients' ? `${styles.sidebar__menuItemLink} ${styles.sidebar__menuItemLinkActive}` : styles.sidebar__menuItemLink} onClick={modalClose}>
              <FontAwesomeIcon icon={faBuildingColumns} />
              Клиенты
            </Link>
          </li>
          <li className={styles.sidebar__menuItem}>
            <Link to='/deals' className={location.pathname === '/deals' ? `${styles.sidebar__menuItemLink} ${styles.sidebar__menuItemLinkActive}` : styles.sidebar__menuItemLink} onClick={modalClose}>
              <FontAwesomeIcon icon={faFolderOpen} />
              Сделки
            </Link>
          </li>
          {(authUserRoleId === 2 || authUserRoleId === 3) &&
            <li className={styles.sidebar__menuItem}>
              <button className={styles.sidebar__menuAddUserBtn} onClick={addUser}>
                <FontAwesomeIcon icon={faUserPlus} />
                Добавить пользователя
              </button>
            </li>
          }
        </ul>
      </div>
      <div className={styles.sidebar__down}>
        <div className={styles.sidebar__poweredBy}>
          <p className={styles.sidebar__copyright}>Powered by</p>
          <img className={styles.sidebar__mbLogo} src={megabulkLogo} alt='MegaБульк Ind.' />
        </div>
        {isSignoutLoading
          ?  <FontAwesomeIcon className={styles.sidebar__spinner} icon={faHurricane} spin />
          :  <button className={styles.sidebar__logout} onClick={logout}>
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
              Выйти
            </button>
        }
      </div>
    </aside>
  );
}