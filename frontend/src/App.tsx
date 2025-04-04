import { useState, useEffect } from 'react';
import './App.css';

function ArticleRecommendations() {
  const [articles, setArticles] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [contentRecommendations, setContentRecommendations] = useState<
    string[]
  >([]);
  const [csvData, setCsvData] = useState<string[][]>([]);

  // Parsing CSV content into a 2D array
  const parseCSV = (csvText: string): string[][] => {
    const rows = csvText.split('\n');
    return rows.map((row) => {
      const regex = /(".*?"|[^",\n]+)(?=\s*,|\s*$)/g;
      return (
        row.match(regex)?.map((field) => field.replace(/(^"|"$)/g, '')) || []
      );
    });
  };

  // Fetching CSV and extracting column names
  useEffect(() => {
    fetch('/article_recommendations.csv')
      .then((response) => response.text())
      .then((text) => {
        const rows = parseCSV(text);
        const articleTitles: string[] = rows
          .slice(1)
          .map((row) => row[0])
          .filter(Boolean);
        setArticles(articleTitles);
      })
      .catch((error) =>
        console.error('Error loading article recommendations CSV:', error)
      );

    fetch('/content_filter.csv')
      .then((response) => response.text())
      .then((text) => {
        const rows = parseCSV(text);
        const columnNames: string[] = rows[0];
        setColumns(columnNames);
        setCsvData(rows);
      })
      .catch((error) => console.error('Error loading CSV:', error));
  }, []);

  const fetchArticleRecommendations = () => {
    fetch('/article_recommendations.csv')
      .then((response) => response.text())
      .then((text) => {
        const rows = parseCSV(text);
        const data = rows.slice(1);
        const articleRow = data.find((row) => row[0] === selectedArticle);
        if (articleRow) {
          setRecommendations(articleRow.slice(1, 6));
        } else {
          setRecommendations([]);
        }
      })
      .catch((error) =>
        console.error('Error fetching article recommendations:', error)
      );
  };

  const fetchContentRecommendations = () => {
    if (!selectedColumn) return;

    const columnIndex = columns.indexOf(selectedColumn) + 1;
    if (columnIndex === -1) {
      console.error('Invalid column selected');
      return;
    }

    const columnValues = csvData.slice(1).map((row) => ({
      id: row[0],
      value: parseFloat(row[columnIndex]),
    }));

    const sortedValues = columnValues
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    const topIds = sortedValues.map((row) => row.id);
    setContentRecommendations(topIds);
  };

  return (
    <div className="container">
      <h2 className="title">Article Recommendation System</h2>

      {/* Article-based recommendations */}
      <div className="input-group">
        <label htmlFor="article-select">
          Select an Article (Article-based):
        </label>
        <select
          id="article-select"
          value={selectedArticle}
          onChange={(e) => setSelectedArticle(e.target.value)}
        >
          <option value="">-- Select an Article --</option>
          {articles.map((article) => (
            <option key={article} value={article}>
              {article}
            </option>
          ))}
        </select>
        <button onClick={fetchArticleRecommendations} className="recommend-btn">
          Get Article Recommendations
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h3>Article-Based Recommended Articles</h3>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Content-based recommendations */}
      <div className="input-group">
        <label htmlFor="content-select">Select an article ID:</label>
        <select
          id="content-select"
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
        >
          <option value="">-- Select an ID --</option>
          {columns.map((column, index) => (
            <option key={index} value={column}>
              {column}
            </option>
          ))}
        </select>
        <button onClick={fetchContentRecommendations} className="recommend-btn">
          Get Content Recommendations
        </button>
      </div>

      {contentRecommendations.length > 0 && (
        <div className="recommendations">
          <h3>Content-Based Recommended Articles</h3>
          <ul>
            {contentRecommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* API-based predictions (replaced with static images) */}
      <div className="input-group">
        <h3>Azure ML Predictions (Sample Output)</h3>
      </div>

      <div className="image-gallery">
        <img
          src="/Stage1.png"
          alt="Prediction 1"
          className="prediction-image"
        />
        <img
          src="/stage2.png"
          alt="Prediction 2"
          className="prediction-image"
        />
        <img
          src="/stage3.png"
          alt="Prediction 3"
          className="prediction-image"
        />
      </div>
    </div>
  );
}

export default ArticleRecommendations;
