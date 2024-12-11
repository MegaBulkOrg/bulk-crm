import { useEffect } from "react";
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMediaQuery } from 'react-responsive';
import crmLogo from '/img/crm_logo.png';
import img from '/img/401_page.png';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import { useNavigate } from "react-router-dom";
import styles from "./error401.module.sass";

export function Error401() {
  const authStatus = useAppSelector(state => state.auth.isAuth)
  const navigation = useNavigate();

  useEffect(() => {
    authStatus
      ? document.title = 'Доступ закрыт - БулькCRM'
      : navigation('/login')
  }, [])

  const isMobile = useMediaQuery({ query: '(max-width: 740px)' })
    
  return (
    <section className={styles.error}>
      {isMobile &&
        <img className={styles.error__logo} src={crmLogo} alt='БулькCRM' />
      }
      <div className={styles.container}>          
        <img className={styles.error__pageImg} src={img} alt='Ошибка 404' />
        <div className={styles.error__text}>
          <h1>Ошибка 401</h1>
          <h2>Доступ закрыт</h2>
        </div>
        <Link className={styles.error__toHome} to='/'>
          На Главную
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>
    </section>
  )
}
