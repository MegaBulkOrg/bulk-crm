import { useEffect } from "react";
import { ClientsWidget } from "Components/Home/ClientsWidget";
import { DealsWidget } from "Components/Home/DealsWidget";
import { NotesWidget } from "Components/Home/NotesWidget";
import { UsersWidget } from "Components/Home/UsersWidget";
import { useMediaQuery } from 'react-responsive';
import { useAppSelector } from '../../redux/hooks';
import { useNavigate } from "react-router-dom";
import styles from './home.module.sass';

export function Home() {
  const authStatus = useAppSelector(state => state.auth.isAuth)
  const navigation = useNavigate();

  useEffect(() => {
    if (authStatus) {
      const h1 = document.querySelector('h1')
      if (h1 !== null) h1.textContent = `Общая информация`
      document.title = `БулькCRM - система управления клиентами организации`
    } else {
      navigation('/login')
    }
  }, [])

  const isMobile = useMediaQuery({ query: '(max-width: 960px)' })
  
  return (
    <section className={styles.home}>
      <div className={styles.container}>
        <UsersWidget/>
        {!isMobile 
          ? <><DealsWidget/><ClientsWidget/></> 
          : <><ClientsWidget/><DealsWidget/></>
        }
        <NotesWidget/>
      </div>
    </section>
  );
}
