import { useState, MouseEvent } from 'react';
import Card from '@/components/Shared/Card/Card';
import Button from '@/components/Shared/Button/Button';
import styles from '@/components/GameCard/GameCard.module.css';

interface Props {
  title: string;
  coverUrl: string | null;
  releaseYear: number | null;
  isAdded: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onClick: () => void;
}

export default function GameCard({
  title,
  coverUrl,
  releaseYear,
  isAdded,
  onAdd,
  onRemove,
  onClick,
}: Props) {
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  const handleButtonClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (isAdded) {
      onRemove();
    } else {
      onAdd();
    }
  };

  const buttonVariant = isAdded
    ? isHoveringButton
      ? 'ghost'
      : 'success'
    : 'primary';

  const buttonText = isAdded
    ? isHoveringButton
      ? '✕ Remover da Biblioteca'
      : '✓ Adicionado'
    : 'Adicionar à Biblioteca';

  return (
    <Card className={styles.gameCard} onClick={onClick}>
      <div className={styles.imageWrapper}>
        {coverUrl ? (
          <img src={coverUrl} alt={title} className={styles.cover} />
        ) : (
          <div className={styles.coverFallback}>Sem Imagem</div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        {releaseYear && <p className={styles.meta}>{releaseYear}</p>}
        <Button
          variant={buttonVariant}
          fullWidth
          onClick={handleButtonClick}
          onMouseEnter={() => setIsHoveringButton(true)}
          onMouseLeave={() => setIsHoveringButton(false)}
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  );
}