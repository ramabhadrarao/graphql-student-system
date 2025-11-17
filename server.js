const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');
const schema = require('./schema/schema');
const path = require('path');
const app = express();

// ==================== MIDDLEWARE ====================

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// ==================== MONGODB CONNECTION ====================

mongoose.connect('mongodb://localhost:27017/student_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Error:', err));
app.use('/docs', express.static(path.join(__dirname, 'docs')));
// ==================== GRAPHQL ENDPOINT ====================

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true // Enable GraphiQL UI at http://localhost:4000/graphql
}));

// ==================== SIMPLE REST ENDPOINT (Optional) ====================

app.get('/', (req, res) => {
  res.send(`
    <h1>🎓 Student Management System</h1>
    <p>GraphQL Endpoint: <a href="/graphql">/graphql</a></p>
  `);
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 GraphiQL UI: http://localhost:${PORT}/graphql`);
});