import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "Redux/hooks";
import { modalSwitch } from "Redux/slices/modalSwitcherSlice";
import { IDeal } from "Redux/apiInterfaces";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faDollar, faEuro, faRmb, faRub, faIndianRupee } from '@fortawesome/free-solid-svg-icons';
import { useGetCurrentClientQuery } from "Redux/api/clients";
import { Link, useNavigate } from 'react-router-dom';
import noAvatar from '/img/no_avatar.png';
import noLogo from '/img/no_photo.png';
import { useGetCurrentUserQuery } from "Redux/api/users";
import { useLazyRefreshQuery, useSignoutMutation } from "Redux/api/auth";
import { tokenErrorHandler } from "../../../helpers/tokenErrorHandler";
import { tzDateStringToCommonDateString } from "../../../helpers/date";
import styles from './dealinfo.module.sass';

export function DealInfo({ deal }: { deal: IDeal }) {
    const authUserId = useAppSelector(state => state.auth.authUserId)

    const dispatch = useAppDispatch()
    
    function editDeal() {
        dispatch(modalSwitch({open: true, modalName: 'updateDeal', itemId: Number(deal.id)}))
    }

    const {data: client, isSuccess: isClientSuccess, isError: isClientError, error: clientError, refetch: refetchClient} = useGetCurrentClientQuery(deal.id_client)
    const {data: manager, isSuccess: isManagerSuccess, isError: isManagerError, error: managerError, refetch: refetchManager} = useGetCurrentUserQuery(client && 'id' in client ? client.id_user : 1)

    let dealCurrency: JSX.Element
    if (deal.currency.code === 'RUB') dealCurrency = <FontAwesomeIcon icon={faRub} />
    if (deal.currency.code === 'CNY') dealCurrency = <FontAwesomeIcon icon={faRmb} />
    if (deal.currency.code === 'EUR') dealCurrency = <FontAwesomeIcon icon={faEuro} />
    if (deal.currency.code === 'USD') dealCurrency = <FontAwesomeIcon icon={faDollar} />
    if (deal.currency.code === 'INR') dealCurrency = <FontAwesomeIcon icon={faIndianRupee} />

    let status = ''
    if (deal.status.id === 1) status = 'Обсуждение'
    if (deal.status.id === 2) status = 'Переговоры'
    if (deal.status.id === 3) status = 'Подписание'
    if (deal.status.id === 4) status = 'Завершена'
    if (deal.status.id === 5) status = 'Отменена'

    const dealInfo = [
        {title: 'Сумма', value: deal.sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')},        
        {title: 'Статус', value: status},
        {title: 'Дата начала подготовки', value: tzDateStringToCommonDateString(deal.beginning_date)},
        {title: 'Дата завершения', value: deal.completion_date ? tzDateStringToCommonDateString(deal.completion_date) : 'Не завершена'}
    ]

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const navigate = useNavigate()
    useEffect(() => {
        async function tokenError() {
            if (isClientError && 'status' in clientError && (clientError.status === 401 || clientError.status === 403)) {
                const response = await tokenErrorHandler({error:clientError, dispatch, signout, authUserId, refresh})
                response ? refetchClient() : navigate('/login')
            }      
            if (isManagerError && 'status' in managerError && (managerError.status === 401 || managerError.status === 403)) {
                const response = await tokenErrorHandler({error:managerError, dispatch, signout, authUserId, refresh})
                response ? refetchManager() : navigate('/login')
            }
        }
        tokenError()
    }, [isClientError, clientError, isManagerError, managerError])

    return (
        <section className={styles.dealinfo}>            
            <div className={styles.container}>
                <div className={styles.dealinfo__up}>
                    <button className={styles.dealinfo__editButton} onClick={editDeal}>
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <h2 className={styles.dealinfo__title}>Клиент</h2>
                    {isClientError && 'status' in clientError && (clientError.status === 401 || clientError.status === 403) &&
                        <p className={styles.dealinfo__infoItem__value}>Обновляем Access токен. Повторно получаем данные клиента.</p>
                    }
                    {isClientSuccess && 'id' in client &&  
                        <Link className={styles.dealinfo__client} to={`/clients/${deal.id_client}`}>
                            <div className={styles.dealinfo__imgWrapper}>
                                <img className={styles.dealinfo__img} src={client.logo 
                                    ? `${import.meta.env.VITE_REACT_APP_HOST}/api/files/get-img/clients/${client.logo}` 
                                    : noLogo} alt={client?.title} 
                                />
                            </div>
                            <p className={styles.dealinfo__clientTitle}>{client.title}</p>
                        </Link>
                    }
                    <h2 className={styles.dealinfo__managerTitle}>Менеджер клиента</h2>
                    {isManagerError && 'status' in managerError && (managerError.status === 401 || managerError.status === 403) &&
                        <p className={styles.dealinfo__infoItem__value}>Обновляем Access токен. Повторно получаем данные менеджера.</p>
                    }
                    {isManagerSuccess && 'id' in manager && client && 'id' in client &&                   
                        <Link className={styles.dealinfo__manager} to={`/users/${client?.id_user || 1}`}>
                            <img className={styles.dealinfo__managerAvatar} src={manager.avatar 
                                ? `${import.meta.env.VITE_REACT_APP_HOST}/api/files/get-img/users/${manager.avatar}` 
                                : noAvatar} 
                            alt={manager?.name} />
                            <p className={styles.dealinfo__infoItem__value}>{manager.name}</p>
                        </Link>
                    }
                </div>
                <div className={styles.dealinfo__down}>
                    <h2 className={styles.dealinfo__title}>Информация</h2>
                    <div className={styles.dealinfo__content}>
                        {dealInfo.map((item, index) => (
                            <div key={index} className={styles.dealinfo__content__item}>
                                <h3 className={styles.dealinfo__content__itemTitle}>{item.title}</h3>
                                <p className={styles.dealinfo__content__itemValue}>
                                    {item.value}
                                    &nbsp;
                                    {item.title === 'Сумма' && dealCurrency}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}