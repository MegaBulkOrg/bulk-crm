import noAvatar from '/img/no_avatar.png';
import { IUser } from 'Redux/apiInterfaces';
import { Link } from 'react-router-dom';
import styles from './homeusersitem.module.sass';

export function HomeUsersItem(props:IUser) {  
  return (
    <li key={props.id}>
      <Link className={styles.item} to={`/users/${props.id}`}>
        <div className={styles.item__up}>
          <div className={styles.item__imgWrapper}>
            <img className={styles.item__img} src={props.avatar 
              ? `${import.meta.env.VITE_REACT_APP_HOST}/api/files/get-img/users/${props.avatar}` 
              : noAvatar} 
            alt={props.name} />
          </div>
          <p className={styles.item__name}>{props.name}</p>
          {props.job && <p className={styles.item__job}>{props.job}</p>}
        </div>
        {props.specialization && props.specialization !== 'Отсутствует' && 
          <span className={styles.item__specialization}>{props.specialization}</span>
        }
      </Link>
    </li>
  );
}