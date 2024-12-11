import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { UserPageListsSwitch } from "../UserPageListsSwitch";
import { faArrowDownShortWide, faArrowUpWideShort } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from "Redux/hooks";
import { changeSortDir, changeUserPageList } from "Redux/slices/itemsListsSlice";
import { useGetClientsByCurrentUserQuery } from "Redux/api/clients";
import { useGetDealsByCurrentUserQuery } from "Redux/api/deals";
import { IClient, IDeal } from "Redux/apiInterfaces";
import { GenericElements } from "Components/GenericElements";
import { HomeClientsItem } from "Components/Items/HomeClientsItem";
import { DealsListPage } from "Components/Items/DealsListPage";
import { tokenErrorHandler } from "../../../helpers/tokenErrorHandler";
import { useLazyRefreshQuery, useSignoutMutation } from "Redux/api/auth";
import styles from './userlists.module.sass';

type TProps = {
    aboutText: string
    role: string
}

export function UserLists(props:TProps) {
    const safeDescription = DOMPurify.sanitize(props.aboutText)
    const location = useLocation();
    const userId = location.pathname.slice(7);

    const sortDir = useAppSelector(state => state.itemsLists.sortby) || 'asc'
    const pageList = useAppSelector(state => state.itemsLists.userPageList)

    const authState = useAppSelector(state => state.auth)

    const dispatch = useAppDispatch()
    function sortDirChange() {
        if(sortDir === 'asc') {
            dispatch(changeSortDir({sortby: 'desc'}))
        } else {
            dispatch(changeSortDir({sortby: 'asc'}))
        }
    }

    useEffect(() => {
        return () => {
            dispatch(changeSortDir({sortby: 'asc'}))
            dispatch(changeUserPageList({userPageList: 'clients'}))
        }
    }, [])

    const { data: clients = [], isLoading: isClientsLoading, isSuccess: isClientsSuccess, isError: isClientError, error: clientsError, refetch: refetchClients } = useGetClientsByCurrentUserQuery({
        id: Number(userId),
        sortDir
    })
    const { data: deals = [], isLoading: isDealsLoading, isSuccess: isDealsSuccess, isError: isDealsError, error: dealsError, refetch: refetchDeals } = useGetDealsByCurrentUserQuery({
        id: Number(userId),
        sortDir
    })

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const navigate = useNavigate()
    useEffect(() => {
        async function tokenError() {
            if (isClientError && 'status' in clientsError && (clientsError.status === 401 || clientsError.status === 403)) {
                const response = await tokenErrorHandler({error:clientsError, dispatch, signout, authUserId:authState.authUserId, refresh})
                response ? refetchClients() : navigate('/login')
            }      
            if (isDealsError && 'status' in dealsError && (dealsError.status === 401 || dealsError.status === 403)) {
                const response = await tokenErrorHandler({error:dealsError, dispatch, signout, authUserId:authState.authUserId, refresh})
                response ? refetchDeals() : navigate('/login')
            }
        }
        tokenError()
    }, [isClientError, clientsError, isDealsError, dealsError])

    return (
        <section className={styles.userlists}>
            <div className={styles.container}>
                {props.aboutText &&
                    <div className={styles.userlists__descriptionWrapper}>
                        <h2 className={styles.userlists__descriptionTitle}>Характеристика сотрудника</h2>
                        <div className={styles.userlists__description} dangerouslySetInnerHTML={{ __html: safeDescription }} />
                    </div>
                }
                {authState.authUserRoleId !== 1 && props.role === 'manager' && <>
                    <div className={styles.userlists__controls}>
                        <UserPageListsSwitch />
                        <div className={styles.userlists__sortBtn} onClick={sortDirChange}>
                            {sortDir === 'asc' ? <FontAwesomeIcon icon={faArrowDownShortWide} /> : <FontAwesomeIcon icon={faArrowUpWideShort} />}
                        </div>
                    </div>
                    <div className={styles.userlists__content}>
                        {pageList === 'clients' && isClientsLoading  && <p className={styles.userslists__msg}>Загрузка...</p>}
                        {pageList === 'deals' && isDealsLoading && <p className={styles.userslists__msg}>Загрузка...</p>}
                        
                        {pageList === 'clients' && isClientError && 'status' in clientsError && (clientsError.status === 401 || clientsError.status === 403) &&
                            <p className={styles.userslist__msg}>Обновляем Access токен. Повторно получаем данные.</p>
                        }
                        {pageList === 'deals' && isDealsError && 'status' in dealsError && (dealsError.status === 401 || dealsError.status === 403) &&
                            <p className={styles.userslist__msg}>Обновляем Access токен. Повторно получаем данные.</p>
                        }

                        {pageList === 'clients' && isClientError && 'status' in clientsError && clientsError.status !== 401 && clientsError.status !== 403 && 
                            <p className={styles.userslists__msg}>Не получилось загрузить данные</p>
                        }
                        {pageList === 'deals' && isDealsError && 'status' in dealsError && dealsError.status !== 401 && dealsError.status !== 403 &&
                            <p className={styles.userslists__msg}>Не получилось загрузить данные</p>
                        }
                        
                        {pageList === 'clients' && isClientsSuccess && Array.isArray(clients) && clients.length === 0 && 
                            <p className={styles.userslists__msg}>По данному пользователю не найдено ни одного клиента</p>
                        }
                        {pageList === 'deals' && isDealsSuccess && Array.isArray(deals) && deals.length === 0 && 
                            <p className={styles.userslists__msg}>По данному пользователю не найдено ни одной сделки</p>
                        }
                        
                        {pageList === 'clients' && isClientsSuccess && Array.isArray(clients) && clients.length !== 0 &&
                            <ul className={styles.userlists__clentsList}>
                                <GenericElements<IClient> list={clients} Template={HomeClientsItem}/>
                            </ul>
                        }
                        {pageList === 'deals' && isDealsSuccess && Array.isArray(deals) && deals.length !== 0 &&
                            <div className={styles.userlists__dealsList}>
                                <GenericElements<IDeal> list={deals} Template={DealsListPage}/>
                            </div>
                        }
                    </div>
                </>}
            </div>
        </section>
    );
}