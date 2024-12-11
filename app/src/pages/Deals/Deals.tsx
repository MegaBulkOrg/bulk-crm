import { useEffect } from "react";
import { DealsList } from "Components/DealsList";
import { useAppSelector } from '../../redux/hooks';
import { useNavigate } from "react-router-dom";
import styles from './deals.module.sass';

export function Deals() {
  const authStatus = useAppSelector(state => state.auth.isAuth)
  const navigation = useNavigate();
  
  useEffect(() => {
    if (authStatus) {
      const h1 = document.querySelector('h1')
      if (h1 !== null) h1.textContent = `Сделки`
      document.title = `Сделки - БулькCRM`
    } else {
      navigation('/login')
    }
  }, [])

  return (
    <section className={styles.deals}>
      <div className={styles.container}>
        <DealsList />
      </div>
    </section>
  );
}
