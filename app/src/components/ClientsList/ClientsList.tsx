import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "Redux/hooks";
import { changeSortDir } from "Redux/slices/itemsListsSlice";
import { useGetAllClientsQuery } from "Redux/api/clients";
import { useNavigate } from "react-router-dom";
import { GenericElements } from "Components/GenericElements";
import { IClient } from "Redux/apiInterfaces";
import { HomeClientsItem } from "Components/Items/HomeClientsItem";
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLazyRefreshQuery, useSignoutMutation } from "Redux/api/auth";
import { tokenErrorHandler } from '../../helpers/tokenErrorHandler';
import styles from './clientslist.module.sass';

export function ClientsList() {
    const sortDir = useAppSelector(state => state.itemsLists.sortby) || 'asc'
    const authState = useAppSelector(state => state.auth)

    const dispatch = useAppDispatch()
    useEffect(() => {
        return () => {
            dispatch(changeSortDir({sortby: 'asc'}))
        }
    }, [])

    const searchParams = new URLSearchParams(window.location.search)
    const openPageNo = searchParams.get('page')
    const [pageNo, setPageNo] = useState(Number(openPageNo) || 1)
    const itemsPerPage = 8
    const [firstPageItemNo, setFirstPageItemNo] = useState(0)
    const [lastPageItemNo, setLastPageItemNo] = useState(0)
    function prevPage() {
        if (pageNo > 1) setPageNo(pageNo => pageNo - 1)
    }
    function nextPage() {
        setPageNo(pageNo => pageNo + 1)
    }
    const navigate = useNavigate()

    const { data, isLoading, isSuccess, isError, error, refetch } = useGetAllClientsQuery(authState.authUserRoleId === 1
        ? {
            mode: 'byManager',
            id: authState.authUserId || 0,        
            offset: firstPageItemNo >= 1 ? firstPageItemNo - 1 : 0,
            limit: itemsPerPage,
            sortDir
        }
        : {
            mode: 'all',
            offset: firstPageItemNo >= 1 ? firstPageItemNo - 1 : 0,
            limit: itemsPerPage,
            sortDir
        }    
    )

    useEffect(() => {
        pageNo > 1 ? navigate(`/clients?page=${pageNo}`) : navigate('/clients')
        setFirstPageItemNo(pageNo * itemsPerPage - itemsPerPage + 1)
        if (data && 'quantity' in data) {
            if(data.quantity && pageNo * itemsPerPage < data.quantity) setLastPageItemNo(pageNo * itemsPerPage)
            if(pageNo * itemsPerPage >= data.quantity) setLastPageItemNo(data.quantity)
        }
    }, [pageNo, data])

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    useEffect(() => {
        async function tokenError() {    
            if (isError && 'status' in error && (error.status === 401 || error.status === 403)) {
                const response = await tokenErrorHandler({error, dispatch, signout, authUserId:authState.authUserId, refresh})
                response ? refetch() : navigate('/login')
            }
        }
        tokenError()
    }, [isError, error])

    return (
        <div className={styles.clientslist}>
            {isLoading && <p className={styles.clientslist__msg}>Загрузка...</p>}
            {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
                <p className={styles.clientslist__msg}>Обновляем Access токен. Повторно получаем данные пользователей.</p>
            }
            {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
                <p className={styles.clientslist__msg}>Не получилось загрузить данные клиентов</p>
            }
            {isSuccess && data && 'quantity' in data && data.quantity === 0 && 
                <p className={styles.clientslist__msg}>Пока нет ни одного клиента</p>
            }
            {isSuccess && data && 'items' in data && data.quantity !== 0 &&
                <ul className={styles.clientslist__list}>
                    <GenericElements<IClient> list={data.items} Template={HomeClientsItem}/>
                </ul>
            }
            {isSuccess && data && 'quantity' in data && data.quantity !== 0 &&
                <div className={styles.clientslist__pagination}>
                    <div className={styles.clientslist__pagination__wrapper}>
                        <div className={styles.clientslist__pagination__info}>
                            <span>{firstPageItemNo}-{lastPageItemNo}</span>
                            &nbsp;<span>из</span>&nbsp;<span>{data.quantity}</span>
                        </div>
                        <div className={styles.clientslist__pagination_btns}>
                            <button className={styles.clientslist__pagination__btn} onClick={prevPage} disabled={pageNo === 1}>
                                <FontAwesomeIcon icon={faArrowLeft}/>
                            </button>
                            <button className={styles.clientslist__pagination__btn} onClick={nextPage} disabled={lastPageItemNo >= data.quantity}>
                                <FontAwesomeIcon icon={faArrowRight}/>
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}