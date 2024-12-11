import crmLogo from '/img/crm_logo.png';
import mainPic from '/img/loginpage.png';
import styles from './loginleftside.module.sass';

export function LoginLeftSide() {  
  return (
    <div className={styles.loginleftside}>
      <div className={styles.loginleftside__titleWrapper}>
        <img className={styles.loginleftside__logo} src={crmLogo} alt='БулькCRM' />
        <p className={styles.loginleftside__title}>БулькCRM</p>
      </div>
      <p className={styles.loginleftside__slogan}>
        Место для вашего роста 
        <br/>
        Управляй. Планируй. Создавай. 
      </p>
      <img className={styles.sidebar__mainPic} src={mainPic} alt="" />
    </div>
  );
}