import { useState, useEffect } from 'react';
import './App.css';

function ArticleRecommendations() {
  const [articles, setArticles] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string[]>([]); // For article-based recommendations
  const [columns, setColumns] = useState<string[]>([]); // To hold the column names
  const [selectedColumn, setSelectedColumn] = useState<string>(''); // To store selected column
  const [contentRecommendations, setContentRecommendations] = useState<
    string[]
  >([]); // Recommendations
  const [csvData, setCsvData] = useState<string[][]>([]); // To store all CSV data

  // Parsing CSV content into a 2D array
  const parseCSV = (csvText: string): string[][] => {
    const rows = csvText.split('\n');
    return rows.map((row) => {
      // Regular expression to match fields enclosed in quotes, or just plain fields
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
        setArticles(articleTitles); // Set article titles for article-based recommendations
      })
      .catch((error) =>
        console.error('Error loading article recommendations CSV:', error)
      );

    fetch('/content_filter.csv')
      .then((response) => response.text())
      .then((text) => {
        const rows = parseCSV(text);
        const columnNames: string[] = rows[0]; // The first row contains the column names
        setColumns(columnNames); // Set the column names to state
        setCsvData(rows); // Save the CSV data for later use
      })
      .catch((error) => console.error('Error loading CSV:', error));
  }, []);

  const fetchArticleRecommendations = () => {
    fetch('/article_recommendations.csv')
      .then((response) => response.text())
      .then((text) => {
        const rows = parseCSV(text);
        const data = rows.slice(1); // Remove header row
        const articleRow = data.find((row) => row[0] === selectedArticle);
        if (articleRow) {
          setRecommendations(articleRow.slice(1, 6)); // Get Recommendations 1-5 for article-based
        } else {
          setRecommendations([]);
        }
      })
      .catch((error) =>
        console.error('Error fetching article recommendations:', error)
      );
  };

  const fetchContentRecommendations = () => {
    // If no column is selected, don't do anything
    if (!selectedColumn) return;

    // Find the index of the selected column
    const columnIndex = columns.indexOf(selectedColumn) + 1;

    if (columnIndex === -1) {
      console.error('Invalid column selected');
      return;
    }

    // Exclude the header row and extract the values from the selected column
    const columnValues = csvData.slice(1).map((row) => ({
      id: row[0], // First column is the ID
      value: parseFloat(row[columnIndex]), // Convert the selected column value to a number for sorting
    }));

    // Sort the rows by the selected column value in descending order
    const sortedValues = columnValues
      .sort((a, b) => b.value - a.value) // Sorting in descending order
      .slice(0, 5); // Get top 5 rows

    // Extract the IDs of the top 5 rows
    const topIds = sortedValues.map((row) => row.id);

    // Set the recommendations to display
    setContentRecommendations(topIds);
  };

  return (
    <>
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
          <button
            onClick={fetchArticleRecommendations}
            className="recommend-btn"
          >
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
          <button
            onClick={fetchContentRecommendations}
            className="recommend-btn"
          >
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
      </div>
    </>
  );
}

export default ArticleRecommendations;
