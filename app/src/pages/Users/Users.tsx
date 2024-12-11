import { UsersList } from "Components/UsersList";
import { useEffect } from "react";
import { useAppSelector } from '../../redux/hooks';
import { useNavigate } from "react-router-dom";
import styles from './users.module.sass';

export function Users() {
  const authStatus = useAppSelector(state => state.auth.isAuth)
  const navigation = useNavigate();
  
  useEffect(() => {
    if (authStatus) {
      const h1 = document.querySelector('h1')
      if (h1 !== null) h1.textContent = `Сотрудники`
      document.title = `Сотрудники - БулькCRM`
    } else {
      navigation('/login')
    }
  }, [])

  return (
    <section className={styles.users}>
      <div className={styles.container}>
        <UsersList />
      </div>
    </section>
  );
}
