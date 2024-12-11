import { useEffect } from "react";
import DOMPurify from "dompurify";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "Redux/hooks";
import { changeSortDir } from "Redux/slices/itemsListsSlice";
import { useGetNotesByCurrentDealQuery } from "Redux/api/notes";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDownShortWide, faArrowUpWideShort, faAdd } from '@fortawesome/free-solid-svg-icons';
import { GenericElements } from "Components/GenericElements";
import { INote } from "Redux/apiInterfaces";
import { DealPageNotesItem } from "Components/Items/DealPageNotesItem";
import { modalSwitch } from "Redux/slices/modalSwitcherSlice";
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import { useLazyRefreshQuery, useSignoutMutation } from "Redux/api/auth";
import styles from './dealnoteslist.module.sass';

export function DealNotesList({ aboutText }: { aboutText: string }) {
    const safeDescription = DOMPurify.sanitize(aboutText) 
    const location = useLocation();
    const dealId = location.pathname.slice(7);
    
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

    const { data = [], isLoading, isSuccess, isError, error, refetch } = useGetNotesByCurrentDealQuery({
        id: Number(dealId),
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
        <section className={styles.dealnoteslist}>
            <div className={styles.container}>
                {aboutText &&
                    <div className={styles.dealnoteslist__descriptionWrapper}>
                        <h2 className={styles.dealnoteslist__descriptionTitle}>Описание сделки</h2>
                        <div className={styles.dealnoteslist__description} dangerouslySetInnerHTML={{ __html: safeDescription }} />
                    </div>
                }
                <div className={styles.dealnoteslist__controls}>
                    <button className={styles.dealnoteslist__addButton} 
                        onClick={() => dispatch(modalSwitch({open: true, modalName: 'addNote', itemId: null}))}
                    >
                        <FontAwesomeIcon icon={faAdd} />
                        Добавить запись
                    </button>
                    <div className={styles.dealnoteslist__sortBtn} onClick={sortDirChange}>
                        {sortDir === 'asc' ? <FontAwesomeIcon icon={faArrowDownShortWide} /> : <FontAwesomeIcon icon={faArrowUpWideShort} />}
                    </div>
                </div>
                <div className={styles.dealnoteslist__content}>
                    {isLoading  && <p className={styles.dealnoteslist__msg}>Загрузка...</p>}

                    {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
                        <p className={styles.clientdealslist__msg}>Обновляем Access токен. Повторно получаем данные.</p>
                    }
                    {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
                        <p className={styles.clientdealslist__msg}>Не получилось загрузить данные</p>
                    } 

                    {isSuccess && Array.isArray(data) && data.length === 0 &&
                        <p className={styles.dealnoteslist__msg}>По данной сделке не найдено ни одной записи</p>
                    }
                    
                    {isSuccess && Array.isArray(data) && data.length !== 0 &&
                        <div className={styles.dealnoteslist__dealsList}>
                            <GenericElements<INote> list={data} Template={DealPageNotesItem}/>
                        </div>
                    }
                </div>
            </div>
        </section>
    );
}