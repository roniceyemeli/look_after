import express, { Request, Response } from "express";
import { Client } from "@elastic/elasticsearch";
import { Pool } from "pg";

const app = express();
const PORT = 5000 || process.env.PORT;

const pgPool = new Pool({
  user: "your_pg_user",
  host: "localhost",
  database: "your_pg_database",
  password: "your_pg_password",
  port: 5432,
});

const esClient = new Client({ node: "http://localhost:9200" });

app.use(express.json());

const titles = [
  {
    id: 1,
    title: "Traditional Marketing Vs Digital Marketing",
    author: "eCommerce FAQs",
    date: new Date(),
  },
  {
    id: 2,
    title: "Global Digital Marketing Courses Market 2019 Business Strategies ",
    author: "Coursera",
    date: new Date(),
  },
  {
    id: 3,
    title: "Big Data vs Data Warehouse",
    author: "Igor",
    date: new Date(),
  },
  {
    id: 4,
    title: "Traditional Marketing Vs Digital Marketing",
    author: "eCommerce FAQs",
    date: new Date(),
  },
  {
    id: 5,
    title: "Cloudera Data Platform gives big data users multi-cloud path",
    author: "Erpinnews",
    date: new Date(),
  },
  {
    id: 6,
    title: "IoT Event Blog Affinity IoT",
    author: "infoMegan Davis",
    date: new Date(),
  },
  {
    id: 7,
    title: "Cloud to cloud backup Solutions Archives",
    author: "Michael Schneider",
    date: new Date(),
  },
  {
    id: 8,
    title: "Car hire with car insurance",
    author: "Gary Hunter",
    date: new Date(),
  },
  {
    id: 9,
    title: "Fashion Jobs and Fashion Career Advice",
    author: "Randy C. Marque",
    date: new Date(),
  },
  {
    id: 10,
    title: "Fashion Designer Zac Posen is Shutting Down his Fashion Label",
    author: "MARCY OSTER, JTA",
    date: new Date(),
  },
];

app.get("/hello", async (req: Request, res: Response) => {
  res.send({ msg: "hello world" });
});

app.post("/search", async (req: Request, res: Response) => {
  const { query } = req.body;
  const { field } = req.query;
  try {
    // Query PostgreSQL database
    // const pgResult = await pgPool.query(
    //   "SELECT * FROM your_table WHERE column ILIKE $1",
    //   [`%${query}%`]
    // );

    for (const title of titles) {
      try {
        await esClient.index({
          index: "titles",
          body: {
            title: title.title,
            author: title.author,
            date: title.date,
          },
        });
      } catch (error: any) {
        res.status(500).json({
          msg: `Error indexing title "${title.title}": ${error.message}`,
        });
      }
    }
    // Query Elasticsearch
    const dynamicQuery = {
      index: "titles",
      body: {
        query: {
          match: {
            [field as string]: query,
          },
        },
      },
    };
    const esResult = await esClient.search(dynamicQuery);

    // Combine and send results
    res.status(200).json({ esResult: esResult.body.hits.hits });
    // await esClient.indices.delete({ index: "titles" });
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
