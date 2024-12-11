import { INote } from 'Redux/apiInterfaces';
import DOMPurify from 'dompurify';
import { useAppDispatch } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { tzDateStringToCommonDateString } from '../../../helpers/date';
import styles from './dealpagenotesitem.module.sass';

export function DealPageNotesItem(props:INote) {  
  const shortContent = props.content.slice(0, 157);
  let safeContent = '';
  if (shortContent.endsWith('</p>')) {
    safeContent = DOMPurify.sanitize(shortContent);
  } else {
    safeContent = DOMPurify.sanitize(shortContent+' ...</p>');
  }

  const dispatch = useAppDispatch();

  return (
    <div className={styles.item} key={props.id} 
      onClick={() => dispatch(modalSwitch({open: true, modalName: 'noteFullInfo', itemId: props.id}))}
    >
      <div className={styles.item__up}>
        <span className={styles.item__title}>{props.title}</span>
        <span className={styles.item__subtitle}>{tzDateStringToCommonDateString(props.creation_date)}</span>
      </div>
      <div className={styles.item__textWrapper} dangerouslySetInnerHTML={{ __html: safeContent }} />
    </div>
  );
}