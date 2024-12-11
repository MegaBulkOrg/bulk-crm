import { useAppDispatch, useAppSelector } from "Redux/hooks";
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { IUser } from "Redux/apiInterfaces";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import noAvatar from '/img/no_avatar.png';
import { dbPhoneFormatting } from '../../../helpers/phone';
import { tzDateStringToCommonDateString } from '../../../helpers/date';
import styles from './userpersonalinfo.module.sass';

export function UserPersonalInfo({ user }: { user: IUser }) {
    const authState = useAppSelector(state => state.auth)

    // это условие не стал помещать в верстку а разместил отдельно так как
    // при размещении в верстке оно отрабатывает не правильно в отношении "не менеджеров"
    const canEditProfile = authState.authUserRoleId !== 1 || (authState.authUserRoleId === 1 && authState.authUserId === Number(user.id))

    const dispatch = useAppDispatch()

    function editProfile() {
        dispatch(modalSwitch({open: true, modalName: 'updateUser', itemId: Number(user.id)}))
    }
    
    const info = [
        {title: 'Дата Рождения', value: user.birthdate ? tzDateStringToCommonDateString(user.birthdate) : 'Не указано'},
        {title: 'Адрес', value: user.address || 'Не указано'}
    ]
    const contacts = [
        {title: 'Email', value: user.email},
        {title: 'Телефон', value: dbPhoneFormatting(user.phone) || 'Не указано'}
    ]
    
    return (
        <section className={styles.userpersonalinfo}>
            <div className={styles.container}>
                <div className={styles.userpersonalinfo__up}>
                    {canEditProfile &&
                        <button className={styles.userpersonalinfo__editButton} onClick={editProfile}>
                            <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                    }
                    <div className={styles.userpersonalinfo__imgWrapper}>
                        <img className={styles.userpersonalinfo__img} src={user.avatar 
                            ? `http://${import.meta.env.VITE_REACT_APP_HOST}:${import.meta.env.VITE_REACT_API_PORT}/api/files/get-img/users/${user.avatar}` 
                            : noAvatar} alt={user.name} 
                        />
                    </div>
                    <h2 className={styles.userpersonalinfo__name}>{user.job}</h2>
                    <p className={styles.userpersonalinfo__job}>Специализация: {user.specialization}</p>
                </div>
                <div className={styles.userpersonalinfo__down}>
                    <h3 className={styles.userpersonalinfo__title}>Информация</h3>
                    <div className={styles.userpersonalinfo__content}>
                        {info.map((item, index) => (
                            <div key={index} className={styles.userpersonalinfo__content__item}>
                                <h4 className={styles.userpersonalinfo__content__itemTitle}>{item.title}</h4>
                                <p className={styles.userpersonalinfo__content__itemValue}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                    <h3 className={styles.userpersonalinfo__title}>Контакты</h3>
                    <div className={styles.userpersonalinfo__content}>
                        {contacts.map((item, index) => (
                            <div key={index} className={styles.userpersonalinfo__content__item}>
                                <h4 className={styles.userpersonalinfo__content__itemTitle}>{item.title}</h4>
                                <p className={styles.userpersonalinfo__content__itemValue}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}