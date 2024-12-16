import { useEffect } from "react";
import { IClient } from "Redux/apiInterfaces";
import { modalSwitch } from "Redux/slices/modalSwitcherSlice";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faCalendar, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faVk, faTelegram } from '@fortawesome/free-brands-svg-icons';
import noAvatar from '/img/no_avatar.png';
import noLogo from '/img/no_photo.png';
import { Link } from 'react-router-dom';
import { useGetCurrentUserQuery } from "Redux/api/users";
import { tokenErrorHandler } from "../../../helpers/tokenErrorHandler";
import { useSignoutMutation, useLazyRefreshQuery } from "Redux/api/auth";
import { useAppDispatch, useAppSelector } from "Redux/hooks";
import { useNavigate } from 'react-router-dom';
import { dbPhoneFormatting } from '../../../helpers/phone';
import { tzDateStringToCommonDateString } from '../../../helpers/date';
import styles from './clientinfo.module.sass';

export function ClientInfo({ client }: { client: IClient }) {
    const authUserId = useAppSelector(state => state.auth.authUserId)
    
    const dispatch = useAppDispatch()
    
    function editClient() {
        dispatch(modalSwitch({open: true, modalName: 'updateClient', itemId: Number(client.id)}))
    }

    const {data: manager, isSuccess: isManagerSuccess, isError: isManagerError, error: managerError, refetch: managerRefetch} = useGetCurrentUserQuery(client.id_user);
    
    const contacts = [
        {title: 'Телефон', value: dbPhoneFormatting(client.phone) || 'Не указано'},
        {title: 'Email', value: client.email || 'Не указано'},
        {title: 'Адрес', value: client.address || 'Не указано'},
        {title: 'Дата лида', value: tzDateStringToCommonDateString(client.lead_date)},
    ]

    let contactPersonContactType
    if(client.contact_person_contact_type === 'phone') contactPersonContactType = <FontAwesomeIcon icon={faPhone} />
    if(client.contact_person_contact_type === 'vk') contactPersonContactType = <FontAwesomeIcon icon={faVk} />
    if(client.contact_person_contact_type === 'telegram') contactPersonContactType = <FontAwesomeIcon icon={faTelegram} />

    let contactPersonContactValue = ''
    if (client.contact_person_contact_type === 'phone') {
        contactPersonContactValue = dbPhoneFormatting(client.contact_person_contact_value)
    } else {
        contactPersonContactValue = client.contact_person_contact_value
    }

    const contactPerson = client.contact_person_contact_value
        ? [
            {title: 'ФИО', value: client.contact_person_name || 'Не указано'},
            {title: contactPersonContactType, value: contactPersonContactValue}
        ]
        : [
            {title: 'ФИО', value: client.contact_person_name || 'Не указано'}
        ]

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const navigate = useNavigate()
    useEffect(() => {
      async function tokenError() {    
          if (isManagerError && 'status' in managerError && (managerError.status === 401 || managerError.status === 403)) {
              const response = await tokenErrorHandler({error:managerError, dispatch, signout, authUserId, refresh})
              response ? managerRefetch() : navigate('/login')
          }
      }
      tokenError()
    }, [isManagerError, managerError])

    return (
        <section className={styles.clientinfo}>
            <div className={styles.container}>
                <div className={styles.clientinfo__up}>
                    <button className={styles.clientinfo__editButton} onClick={editClient}>
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <div className={styles.clientinfo__imgWrapper}>
                        <img className={styles.clientinfo__img} src={client.logo 
                            ? `${import.meta.env.VITE_REACT_APP_HOST}/api/files/get-img/clients/${client.logo}` 
                            : noLogo} 
                        alt={client.title} />                    
                    </div>
                    <div className={styles.clientinfo__infoItem}>
                        <p className={styles.clientinfo__infoItem__title}>Тип клиента</p>
                        <p className={styles.clientinfo__infoItem__value}>{client.type}</p>
                    </div>                                        
                    <div className={styles.clientinfo__infoItem}>
                        <p className={styles.clientinfo__infoItem__title}>Менеджер клиента</p>
                        {isManagerError && 'status' in managerError && (managerError.status === 401 || managerError.status === 403) &&
                            <p className={styles.clientinfo__infoItem__title}>Обновляем Access токен. Повторно получаем данные менеджера.</p>
                        }
                        {isManagerSuccess && 'id' in manager &&
                            <Link className={styles.clientinfo__manager} to={`/users/${client.id_user}`}>
                                <img className={styles.clientinfo__managerAvatar} src={manager.avatar 
                                    ? `${import.meta.env.VITE_REACT_APP_HOST}/api/files/get-img/users/${manager.avatar}` 
                                    : noAvatar} alt={manager.name} 
                                />
                                <p className={styles.clientinfo__infoItem__value}>{manager.name}</p>
                            </Link>
                        }
                    </div>
                    <div className={styles.clientinfo__leadDate}>
                        <FontAwesomeIcon icon={faCalendar}/>
                        Дата лида: {tzDateStringToCommonDateString(client.lead_date)}
                    </div>
                </div>
                <div className={styles.clientinfo__down}>
                    <h2 className={styles.clientinfo__title}>Информация</h2>
                    <div className={styles.clientinfo__content}>
                        {contacts.map((item, index) => (
                            <div key={index} className={styles.clientinfo__content__item}>
                                <h3 className={styles.clientinfo__content__itemTitle}>{item.title}</h3>
                                <p className={styles.clientinfo__content__itemValue}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                    <h2 className={styles.clientinfo__title}>Контактное лицо</h2>
                    <div className={styles.clientinfo__content}>
                        {contactPerson.map((item, index) => (
                            <div key={index} className={styles.clientinfo__content__item}>
                                <h3 className={styles.clientinfo__content__itemTitle}>{item.title}</h3>
                                <p className={styles.clientinfo__content__itemValue}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}