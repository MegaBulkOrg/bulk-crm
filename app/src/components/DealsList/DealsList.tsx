import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "Redux/hooks";
import { changeSortDir } from "Redux/slices/itemsListsSlice";
import { useGetAllDealsQuery } from "Redux/api/deals";
import { useNavigate } from "react-router-dom";
import { GenericElements } from "Components/GenericElements";
import { IDeal } from "Redux/apiInterfaces";
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DealsListPage } from "Components/Items/DealsListPage";
import { useLazyRefreshQuery, useSignoutMutation } from "Redux/api/auth";
import { tokenErrorHandler } from '../../helpers/tokenErrorHandler';
import styles from './dealslist.module.sass';

export function DealsList() {
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

    const { data, isLoading, isSuccess, isError, error, refetch } = useGetAllDealsQuery(authState.authUserRoleId === 1
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
        pageNo > 1 ? navigate(`/deals?page=${pageNo}`) : navigate('/deals')
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
        <div className={styles.dealslist}>
            {isLoading && <p className={styles.dealslist__msg}>Загрузка...</p>}
            {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
                <p className={styles.dealslist__msg}>Обновляем Access токен. Повторно получаем данные сделок.</p>
            }
            {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
                <p className={styles.dealslist__msg}>Не получилось загрузить данные сделок</p>
            }            
            {isSuccess && data && 'quantity' in data && data.quantity === 0 &&
                <p className={styles.dealslist__msg}>Пока нет ни одной сделки</p>
            }
            {isSuccess && data && 'items' in data && data.quantity !== 0 &&
                <div className={styles.dealslist__gridWrapper}>
                    <GenericElements<IDeal> list={data.items} Template={DealsListPage}/>
                </div>
            }
            {isSuccess && data && 'quantity' in data && data.quantity !== 0 &&
                <div className={styles.dealslist__pagination}>
                    <div className={styles.dealslist__pagination__wrapper}>
                        <div className={styles.dealslist__pagination__info}>
                            <span>{firstPageItemNo}-{lastPageItemNo}</span>
                            &nbsp;<span>из</span>&nbsp;<span>{data.quantity}</span>
                        </div>
                        <div className={styles.dealslist__pagination_btns}>
                            <button className={styles.dealslist__pagination__btn} onClick={prevPage} disabled={pageNo === 1}>
                                <FontAwesomeIcon icon={faArrowLeft}/>
                            </button>
                            <button className={styles.dealslist__pagination__btn} onClick={nextPage} disabled={lastPageItemNo >= data.quantity}>
                                <FontAwesomeIcon icon={faArrowRight}/>
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}