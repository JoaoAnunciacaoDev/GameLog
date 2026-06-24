import { useState } from 'react';
import Button from '../Button/Button';
import styles from './GameEditModal.module.css';

const STATUS_OPTIONS = [
  'Quero Jogar', 'Jogando', 'Zerado', 'Platinado', 'Abandonado', 'Em Espera',
];

interface Props {
  userGameId: string;
  title: string;
  coverUrl: string | null;
  initialStatus: string;
  initialRating: number | null;
  initialStartedAt: string | null;
  initialFinishedAt: string | null;
  initialNotes: string | null;
  onSave: (data: {
    status: string;
    rating: number | null;
    started_at: string | null;
    finished_at: string | null;
    notes: string | null;
  }) => Promise<void>;
  onClose: () => void;
}

export default function GameEditModal({
  title,
  coverUrl,
  initialStatus,
  initialRating,
  initialStartedAt,
  initialFinishedAt,
  initialNotes,
  onSave,
  onClose,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [rating, setRating] = useState<number | null>(initialRating);
  const [startedAt, setStartedAt] = useState<string>(initialStartedAt ?? '');
  const [finishedAt, setFinishedAt] = useState<string>(initialFinishedAt ?? '');
  const [notes, setNotes] = useState<string>(initialNotes ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      status,
      rating,
      started_at: startedAt || null,
      finished_at: finishedAt || null,
      notes: notes || null,
    });
    setIsSaving(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>

        <div className={styles.gameInfo}>
          {coverUrl && <img src={coverUrl} alt={title} className={styles.cover} />}
          <h2 className={styles.title}>{title}</h2>
        </div>

        <div className={styles.fields}>
          <label className={styles.label}>
            Status
            <select
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Nota (0-10)
            <input
              type="number"
              className={styles.input}
              min={0}
              max={10}
              value={rating ?? ''}
              onChange={(e) => setRating(e.target.value ? Number(e.target.value) : null)}
            />
          </label>

          <div className={styles.dateRow}>
            <label className={styles.label}>
              Data de início
              <input
                type="date"
                className={styles.input}
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
              />
            </label>
            <label className={styles.label}>
              Data de conclusão
              <input
                type="date"
                className={styles.input}
                value={finishedAt}
                onChange={(e) => setFinishedAt(e.target.value)}
              />
            </label>
          </div>

          <label className={styles.label}>
            Comentário
            <textarea
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escreva um comentário opcional..."
              rows={3}
            />
          </label>
        </div>

        <Button onClick={handleSave} fullWidth disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}