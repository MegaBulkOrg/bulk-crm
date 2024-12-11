import { useEffect } from "react";
import { ClientsList } from "Components/ClientsList";
import { useAppSelector } from '../../redux/hooks';
import { useNavigate } from "react-router-dom";
import styles from './clients.module.sass';

export function Clients() {
  const authStatus = useAppSelector(state => state.auth.isAuth)
  const navigation = useNavigate();
  
  useEffect(() => {
    if (authStatus) {
      const h1 = document.querySelector('h1')
      if (h1 !== null) h1.textContent = `Клиенты`
      document.title = `Клиенты - БулькCRM`
    } else {
      navigation('/login')
    }
  }, [])

  return (
    <section className={styles.clients}>
      <div className={styles.container}>
        <ClientsList />
      </div>
    </section>
  );
}
