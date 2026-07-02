import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useToast } from '@/hooks/useToast';
import Card from '@/components/Shared/Card/Card';
import PageTitle from '@/components/Shared/PageTitle/PageTitle';
import { translateGenre } from '@/utils/genres';
import { resolveImageUrl } from '@/services/media';
import styles from './Profile.module.css';

interface DashboardGame {
  title: string;
  cover_url: string | null;
  hours_played: number;
  rating: number | null;
  finished_at: string | null;
}

interface YearlyGames {
  year: number;
  games: DashboardGame[];
}

interface DashboardData {
  username: string;
  email: string;
  created_at: string | null;
  games_count: number;
  lists_count: number;
  tierlists_count: number;
  status_distribution: Record<string, number>;
  most_played_genre: string | null;
  yearly_games: YearlyGames[];
}

export default function Profile() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());

  const toggleYearCollapse = (year: number) => {
    setCollapsedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  useEffect(() => {
    api.get('/users/me/dashboard')
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        showToast('Erro ao carregar dados do perfil.', 'error');
        navigate('/library');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate, showToast]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (!data) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data desconhecida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusPercentage = (count: number) => {
    if (data.games_count === 0) return 0;
    return Math.round((count / data.games_count) * 100);
  };

  const statusColors: Record<string, string> = {
    'Quero Jogar': 'var(--primary)',
    'Jogando': '#3b82f6',
    'Zerado': '#10b981',
    'Platinado': '#f59e0b',
    'Abandonado': '#ef4444',
    'Em Espera': '#6b7280',
  };

  return (
    <div className={styles.container}>
      {/* Header do Perfil */}
      <section className={styles.profileHeader}>
        <div className={styles.avatarLarge}>
          {data.username.charAt(0).toUpperCase()}
        </div>
        <div className={styles.profileInfo}>
          <PageTitle level="h1">{data.username}</PageTitle>
          <p className={styles.emailText}>{data.email}</p>
          <p className={styles.joinedText}>
            Membro desde {formatDate(data.created_at)}
          </p>
        </div>
      </section>

      {/* Grade de Estatísticas Principais */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{data.games_count}</span>
          <span className={styles.statLabel}>Jogos na Biblioteca</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{data.lists_count}</span>
          <span className={styles.statLabel}>Listas Criadas</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{data.tierlists_count}</span>
          <span className={styles.statLabel}>Tier Lists</span>
        </Card>
      </div>

      <div className={styles.detailsSection}>
        {/* Distribuição de Status */}
        <Card className={styles.detailsCard}>
          <h3 className={styles.cardTitle}>Distribuição por Status</h3>
          <div className={styles.statusList}>
            {Object.entries(data.status_distribution).map(([status, count]) => {
              const pct = getStatusPercentage(count);
              const color = statusColors[status] || 'var(--text-secondary)';
              return (
                <div key={status} className={styles.statusItem}>
                  <div className={styles.statusMeta}>
                    <span className={styles.statusName}>{status}</span>
                    <span className={styles.statusCount}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div
                      className={styles.progressBarFill}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(data.status_distribution).length === 0 && (
              <p className={styles.emptyText}>Nenhum jogo cadastrado com status.</p>
            )}
          </div>
        </Card>

        {/* Gênero Favorito */}
        <Card className={styles.detailsCard}>
          <h3 className={styles.cardTitle}>Gênero Favorito</h3>
          {data.most_played_genre ? (
            <div className={styles.genreHighlight}>
              <div className={styles.gamepadIcon}>🎮</div>
              <span className={styles.genreName}>
                {translateGenre(data.most_played_genre)}
              </span>
              <p className={styles.genreDesc}>
                Este é o gênero mais proeminente e jogado em sua biblioteca do GameLog.
              </p>
            </div>
          ) : (
            <div className={styles.genreHighlight}>
              <div className={styles.gamepadIcon}>❓</div>
              <p className={styles.emptyText}>Adicione jogos com gêneros para gerar estatísticas.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Jogos Mais Jogados por Ano */}
      <section className={styles.timelineSection}>
        <PageTitle level="h2">Histórico de Conclusões por Ano</PageTitle>
        <p className={styles.timelineSubtitle}>
          Seus jogos concluídos mais jogados e melhor avaliados agrupados por ano.
        </p>

        <div className={styles.timeline}>
          {data.yearly_games.map((yearGroup) => {
            const isCollapsed = collapsedYears.has(yearGroup.year);
            return (
              <div key={yearGroup.year} className={`${styles.timelineYearGroup} ${isCollapsed ? styles.collapsedYearGroup : ''}`}>
                <button
                  type="button"
                  className={`${styles.timelineYearBadge} ${isCollapsed ? styles.collapsedBadge : ''}`}
                  onClick={() => toggleYearCollapse(yearGroup.year)}
                >
                  <span className={styles.collapseIcon}>
                    {isCollapsed ? '▶' : '▼'}
                  </span>
                  {yearGroup.year}
                </button>
                
                {!isCollapsed && (
                  <div className={styles.timelineGamesGrid}>
                    {yearGroup.games.map((game, index) => (
                      <Card key={index} className={styles.gameTimelineCard}>
                        <div className={styles.gameCoverWrapper}>
                          {game.cover_url ? (
                            <img
                              src={resolveImageUrl(game.cover_url)}
                              alt={game.title}
                              className={styles.gameCover}
                            />
                          ) : (
                            <div className={styles.gameCoverPlaceholder}>
                              <span>Sem capa</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.gameDetails}>
                          <h4 className={styles.gameTitle} title={game.title}>
                            {game.title}
                          </h4>
                          <div className={styles.gameMetrics}>
                            <span className={styles.metric}>
                              🕒 {game.hours_played}h
                            </span>
                            {game.rating !== null && (
                              <span className={styles.metric}>
                                ⭐ {game.rating}/10
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {data.yearly_games.length === 0 && (
            <Card className={styles.emptyTimelineCard}>
              <p className={styles.emptyText}>
                Nenhum jogo marcado como "Zerado" ou "Platinado" com data de conclusão definida.
              </p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
