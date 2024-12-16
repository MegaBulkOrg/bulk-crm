import noAvatar from '/img/no_avatar.png';
import { IUser } from 'Redux/apiInterfaces';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import { dbPhoneFormatting } from '../../../helpers/phone';
import { tzDateStringToCommonDateString } from '../../../helpers/date';
import styles from './userslistpageitem.module.sass';

export function UsersListTableItem(props:IUser) {
    // Возраст
    const bDate = new Date (props.birthdate)
    const bDateYear = bDate.getFullYear();
    const currentDate = new Date
    const currentYear = currentDate.getFullYear()
    let age = currentYear - bDateYear
    if (currentDate.getMonth() < bDate.getMonth()) age = age - 1
    if (currentDate.getMonth() === bDate.getMonth() && currentDate.getDate() < bDate.getDate()) age = age - 1
    
    const isBigTablet = useMediaQuery({ query: '(max-width: 1200px)' })

    return (
        <li className={styles.tableItem} key={props.id}>
            <Link to={`/users/${props.id}`}>
                <div className={styles.tableItem__wrapper}>  
                    <div className={styles.tableItem__left}>
                        <img src={props.avatar 
                            ? `${import.meta.env.VITE_REACT_APP_HOST}/api/files/get-img/users/${props.avatar}` 
                            : noAvatar} 
                        alt={props.name} />
                        <div className={styles.tableItem__leftFio}>
                            <p>{props.name}</p>
                            <p>{props.email}</p>
                        </div>
                    </div>
                    {isBigTablet && <div className={styles.tableItem__divider}></div>}
                    <div className={styles.tableItem__info}>
                        {props.phone &&
                            <div className={styles.tableItem__infoItem}>
                                <p className={styles.tableItem__infoItem__title}>Телефон</p>
                                <p className={styles.tableItem__infoItem__value}>{dbPhoneFormatting(props.phone)}</p>
                            </div>
                        }
                        {props.birthdate &&
                            <div className={styles.tableItem__infoItem}>
                                <p className={styles.tableItem__infoItem__title}>ДР</p>
                                <p className={styles.tableItem__infoItem__value}>{tzDateStringToCommonDateString(props.birthdate)}</p>
                            </div>
                        }            
                        {props.birthdate &&
                            <div className={styles.tableItem__infoItem}>
                                <p className={styles.tableItem__infoItem__title}>Возраст</p>
                                <p className={styles.tableItem__infoItem__value}>{age}</p>
                            </div>
                        }
                        {props.job && 
                            <div className={styles.tableItem__infoItem}>
                                <p className={styles.tableItem__infoItem__title}>Должность</p>
                                <p className={styles.tableItem__infoItem__value}>
                                    {props.job}
                                    {isBigTablet && props.specialization && props.specialization !== 'Отсутствует' &&
                                        <span className={styles.tableItem__infoItem__valueLabel}>{props.specialization}</span>
                                    }    
                                </p>
                            </div>
                        }   
                    </div>
                    {props.specialization && !isBigTablet && props.specialization !== 'Отсутствует' &&
                        <div className={styles.tableItem__right}>
                            <span className={styles.tableItem__infoItem__valueLabel}>{props.specialization}</span>
                        </div>
                    }
                </div>
            </Link>
        </li>
    );
}