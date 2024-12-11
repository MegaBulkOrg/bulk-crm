import { useEffect } from "react";
import { useAppSelector } from '../../redux/hooks';
import { useNavigate } from "react-router-dom";
import { SearchResults } from "Components/SearchResults";
import styles from './search.module.sass';

export function Search() {
  const authStatus = useAppSelector(state => state.auth.isAuth)
  const navigation = useNavigate();

  useEffect(() => {
    if (authStatus) {
      const h1 = document.querySelector('h1')
      if (h1 !== null) h1.textContent = `Результаты поиска`
      document.title = `Результаты поиска - БулькCRM`
    } else {
      navigation('/login')
    }
  }, [])

  return (
    <section className={styles.search}>
      <div className={styles.container}>
        <SearchResults />
      </div>
    </section>
  );
}
