import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GenericElements } from 'Components/GenericElements';
import { UsersListGridItem, UsersListTableItem } from 'Components/Items/UsersListPage';
import { useCountAllUsersQuery, useGetAllUsersQuery } from 'Redux/api/users';
import { IUser } from 'Redux/apiInterfaces';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { changeItemsTpl, changeSortDir } from 'Redux/slices/itemsListsSlice';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { tokenErrorHandler } from '../../helpers/tokenErrorHandler';
import styles from './userslist.module.sass';

export function UsersList() {
    const sortDir = useAppSelector(state => state.itemsLists.sortby) || 'asc'
    const itemsTpl = useAppSelector(state => state.itemsLists.tpl)

    const dispatch = useAppDispatch()
    useEffect(() => {
        return () => {
            dispatch(changeSortDir({sortby: 'asc'}))
            dispatch(changeItemsTpl({tpl: 'table'}))
        }
    }, [])

    const searchParams = new URLSearchParams(window.location.search)
    const openPageNo = searchParams.get('page')
    const [pageNo, setPageNo] = useState(Number(openPageNo) || 1)
    const itemsPerPage = 8
    const [firstPageItemNo, setFirstPageItemNo] = useState(0)
    const [lastPageItemNo, setLastPageItemNo] = useState(0)
    const { data: totalUsers, isSuccess: isTotalUsersSuccess, isError: isTotalUsersError, error: totalUsersError, refetch: refetchTotalUsers } = useCountAllUsersQuery()
    function prevPage() {
        if (pageNo > 1) setPageNo(pageNo => pageNo - 1)
    }
    function nextPage() {
        setPageNo(pageNo => pageNo + 1)
    }
    const navigate = useNavigate()
    useEffect(() => {
        pageNo > 1 ? navigate(`/users?page=${pageNo}`) : navigate('/users')
        setFirstPageItemNo(pageNo * itemsPerPage - itemsPerPage + 1)
        if (totalUsers && 'quantity' in totalUsers) {
            if (totalUsers && pageNo * itemsPerPage < totalUsers.quantity) setLastPageItemNo(pageNo * itemsPerPage)
            if (totalUsers && pageNo * itemsPerPage >= totalUsers.quantity) setLastPageItemNo(totalUsers.quantity)
        }
    }, [pageNo, totalUsers])

    const { data, isLoading, isSuccess, isError, error, refetch } = useGetAllUsersQuery({
        offset: firstPageItemNo >= 1 ? firstPageItemNo - 1 : 0,
        limit: itemsPerPage,
        sortDir
    })

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const authUserId = useAppSelector(state => state.auth.authUserId)
    useEffect(() => {
        async function tokenError() {
            if (isTotalUsersError && 'status' in totalUsersError && (totalUsersError.status === 401 || totalUsersError.status === 403)) {
                const response = await tokenErrorHandler({error:totalUsersError, dispatch, signout, authUserId, refresh})
                response ? refetchTotalUsers() : navigate('/login')
            }      
            if (isError && 'status' in error && (error.status === 401 || error.status === 403)) {
                const response = await tokenErrorHandler({error, dispatch, signout, authUserId, refresh})
                response ? refetch() : navigate('/login')
            }
        }
        tokenError()
    }, [isError, error, isTotalUsersError, totalUsersError])

    return (
        <div className={styles.userslist}>            
            {isLoading && <p className={styles.userslist__msg}>Загрузка...</p>}
            {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
                <p className={styles.userslist__msg}>Обновляем Access токен. Повторно получаем данные пользователей.</p>
            }
            {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
                <p className={styles.userlist__msg}>Не получилось загрузить данные пользователей</p>
            }            
            {isSuccess && Array.isArray(data) && data.length === 0 &&
                <p className={styles.userslist__msg}>Пока нет ни одного пользователя</p>
            }
            {isSuccess && Array.isArray(data) && data.length !== 0 && itemsTpl === 'table' && 
                <ul className={styles.userslist__list}><GenericElements<IUser> list={data} Template={UsersListTableItem}/></ul>   
            }
            {isSuccess && Array.isArray(data) && data.length !== 0 && itemsTpl === 'grid' && 
                <div className={styles.userslist__gridWrapper}>
                    <GenericElements<IUser> list={data} Template={UsersListGridItem}/>
                </div>
            }
            {isSuccess && Array.isArray(data) && data.length !== 0 && totalUsers && 'quantity' in totalUsers &&
                <div className={styles.userslist__pagination}>
                    <div className={styles.userslist__pagination__wrapper}>
                        <div className={styles.userslist__pagination__info}>
                            <span>{firstPageItemNo}-{lastPageItemNo}</span>
                            {isTotalUsersSuccess &&<>&nbsp;<span>из</span>&nbsp;<span>{totalUsers.quantity}</span></>}
                        </div>
                        <div className={styles.userslist__pagination_btns}>
                            <button className={styles.userslist__pagination__btn} onClick={prevPage} disabled={pageNo === 1}>
                                <FontAwesomeIcon icon={faArrowLeft}/>
                            </button>
                            <button className={styles.userslist__pagination__btn} onClick={nextPage} disabled={totalUsers && lastPageItemNo >= totalUsers.quantity}>
                                <FontAwesomeIcon icon={faArrowRight}/>
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}