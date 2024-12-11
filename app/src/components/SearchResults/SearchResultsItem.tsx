import DOMPurify from 'dompurify';
import { Link } from 'react-router-dom';
import { useAppDispatch } from "Redux/hooks";
import { modalSwitch } from "Redux/slices/modalSwitcherSlice";
import { ISearchResponseItem } from 'Redux/apiInterfaces';
import styles from './searchresults.module.sass';

export function SearchResultsItem(props:ISearchResponseItem) {
    const shortContent = props.description.slice(0, 250);
    let safeContent = '';
    if (shortContent.endsWith('</p>')) {
        safeContent = DOMPurify.sanitize(shortContent);
    } else {
        safeContent = DOMPurify.sanitize(shortContent+' ...</p>');
    }
   
    const dispatch = useAppDispatch()
    function openNoteModal() {
        if (props.item_type === 'notes') dispatch(modalSwitch({open: true, modalName: 'noteFullInfo', itemId: props.id}))
    }

    return (
        <div className={styles.searchresults__item} onClick={openNoteModal}>
            {props.item_type !== 'notes' && 
                <Link to={`/${props.item_type}/${props.id}`} className={styles.searchresults__item__wrapper}>
                    <h2 className={styles.searchresults__item__title}>{props.name}</h2>
                    <div className={styles.searchresults__item__description} dangerouslySetInnerHTML={{ __html: safeContent }} />
                </Link>
            }
            {props.item_type === 'notes' && <div className={styles.searchresults__item__wrapper}>                
                <h2 className={styles.searchresults__item__title}>{props.name}</h2>
                <div className={styles.searchresults__item__description} dangerouslySetInnerHTML={{ __html: safeContent }} />
            </div>}
        </div>
    );
}