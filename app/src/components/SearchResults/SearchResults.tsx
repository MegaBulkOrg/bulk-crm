import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from 'Redux/hooks';
import { useGetSearchResultsQuery } from 'Redux/api/search';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { tokenErrorHandler } from '../../helpers/tokenErrorHandler';
import { useNavigate } from 'react-router-dom';
import { GenericElements } from 'Components/GenericElements';
import { ISearchResponseItem } from 'Redux/apiInterfaces';
import { SearchResultsItem } from './SearchResultsItem';
import styles from './searchresults.module.sass';

export function SearchResults() {
    const location = useLocation();    
    const authState = useAppSelector(state => state.auth)
    
    const { data = [], isLoading, isSuccess, isError, error, refetch } = useGetSearchResultsQuery(authState.authUserRoleId === 1
        ? {
            query: location.search.split('?q=')[1],
            mode: 'byManager',
            id: authState.authUserId || 0,        
            sortDir: 'desc'
        }
        : {
            query: location.search.split('?q=')[1],
            mode: 'all',
            sortDir: 'desc'
        }    
    )
    
    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
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
        <div className={styles.searchresults}>
            {isLoading && <p className={styles.searchresults__msg}>Загрузка...</p>}
            {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
                <p className={styles.searchresults__msg}>Обновляем Access токен. Повторно получаем данные сделок.</p>
            }
            {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
                <p className={styles.searchresults__msg}>Не получилось загрузить данные поиска</p>
            }            
            {isSuccess && Array.isArray(data) && data.length === 0 &&
                <p className={styles.searchresults__msg}>Поиск ничего не дал. Попробуйте переформулировать запрос.</p>
            }
            {isSuccess && Array.isArray(data) && data.length !== 0 &&
                <div className={styles.searchresults__list}>
                    <GenericElements<ISearchResponseItem> list={data} Template={SearchResultsItem}/>
                </div>
            }
        </div>
    );
}