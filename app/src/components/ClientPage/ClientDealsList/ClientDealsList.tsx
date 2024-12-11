import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { faArrowDownShortWide, faArrowUpWideShort, faAdd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from "Redux/hooks";
import { changeSortDir } from "Redux/slices/itemsListsSlice";
import { useGetDealsByCurrentClientQuery } from "Redux/api/deals";
import { IDeal } from "Redux/apiInterfaces";
import { GenericElements } from "Components/GenericElements";
import { DealsListPage } from "Components/Items/DealsListPage";
import { modalSwitch } from "Redux/slices/modalSwitcherSlice";
import { useLazyRefreshQuery, useSignoutMutation } from "Redux/api/auth";
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import styles from './clientdealslist.module.sass';

export function ClientDealsList({ aboutText }: { aboutText: string }) {
    const safeDescription = DOMPurify.sanitize(aboutText)
    const location = useLocation();
    const clientId = location.pathname.slice(9);

    const sortDir = useAppSelector(state => state.itemsLists.sortby) || 'asc'

    const dispatch = useAppDispatch()
    function sortDirChange() {
        if(sortDir === 'asc') {
            dispatch(changeSortDir({sortby: 'desc'}))
        } else {
            dispatch(changeSortDir({sortby: 'asc'}))
        }
    }

    useEffect(() => {
        return () => {dispatch(changeSortDir({sortby: 'asc'}))}
    }, [])

    const { data = [], isLoading, isSuccess, isError, error, refetch } = useGetDealsByCurrentClientQuery({
        id: Number(clientId),
        sortDir
    })

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const authUserId = useAppSelector(state => state.auth.authUserId)
    const navigate = useNavigate()
    useEffect(() => {
        async function tokenError() {   
            if (isError && 'status' in error && (error.status === 401 || error.status === 403)) {
                const response = await tokenErrorHandler({error, dispatch, signout, authUserId, refresh})
                response ? refetch() : navigate('/login')
            }
        }
        tokenError()
    }, [isError, error])

    return (
        <section className={styles.clientdealslist}>
            <div className={styles.container}>
                {aboutText &&
                    <div className={styles.clientdealslist__descriptionWrapper}>
                        <h2 className={styles.clientdealslist__descriptionTitle}>Описание клиента</h2>
                        <div className={styles.clientdealslist__description} dangerouslySetInnerHTML={{ __html: safeDescription }} />
                    </div>
                }
                <div className={styles.clientdealslist__controls}>
                    <button className={styles.clientdealslist__addButton} 
                        onClick={() => dispatch(modalSwitch({open: true, modalName: 'addDeal', itemId: null}))}
                    >
                        <FontAwesomeIcon icon={faAdd} />
                        Добавить сделку
                    </button>
                    <div className={styles.clientdealslist__sortBtn} onClick={sortDirChange}>
                        {sortDir === 'asc' ? <FontAwesomeIcon icon={faArrowDownShortWide} /> : <FontAwesomeIcon icon={faArrowUpWideShort} />}
                    </div>
                </div>
                <div className={styles.clientdealslist__content}>
                    {isLoading  && <p className={styles.clientdealslist__msg}>Загрузка...</p>}

                    {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
                        <p className={styles.clientdealslist__msg}>Обновляем Access токен. Повторно получаем данные.</p>
                    }
                    {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
                        <p className={styles.clientdealslist__msg}>Не получилось загрузить данные</p>
                    } 

                    {isSuccess && Array.isArray(data) && data.length === 0 &&
                        <p className={styles.clientdealslist__msg}>По данному клиенту не найдено ни одной сделки</p>
                    }
                    
                    {isSuccess && Array.isArray(data) && data.length !== 0 &&
                        <div className={styles.clientdealslist__dealsList}>
                            <GenericElements<IDeal> list={data} Template={DealsListPage}/>
                        </div>
                    }
                </div>
            </div>
        </section>
    );
}