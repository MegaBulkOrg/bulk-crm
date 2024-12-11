import { useEffect } from "react";
import { useMediaQuery } from 'react-responsive';
import crmLogo from '/img/crm_logo.png';
import { LoginLeftSide } from "Components/Login/LoginLeftSide/LoginLeftSide";
import { LoginRightSide } from "Components/Login/LoginRightSide/LoginRightSide";
import { useAppSelector } from '../../redux/hooks';
import { useNavigate } from "react-router-dom";
import styles from './login.module.sass';

export function Login() {  
  const authStatus = useAppSelector(state => state.auth.isAuth)
  const navigation = useNavigate();

  useEffect(() => {
    authStatus
      ? navigation('/')
      : document.title = 'Вход в систему - БулькCRM'
  }, [])

  const isMobile = useMediaQuery({ query: '(max-width: 740px)' })

  return (
    <section className={styles.login}>
      {isMobile &&
        <img className={styles.login__logo} src={crmLogo} alt='БулькCRM' />
      }
      <div className={styles.container}>
        <LoginLeftSide/>
        <LoginRightSide/>
      </div>
    </section>
  );
}
