// hard coded data for paths
const paths = [
  {
    id: "1",
    userId: 33, // Using the actual user id from your PostgreSQL users table
    title: "JavaScript Fundamentals",
    description:
      "Learn the basics of JavaScript programming including variables, functions, and DOM manipulation.",
    difficulty: "beginner",
    estimatedHours: 20,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    userId: 33,
    title: "React Development",
    description:
      "Build modern web applications with React, including hooks, state management, and component architecture.",
    difficulty: "intermediate",
    estimatedHours: 35,
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "3",
    userId: 33,
    title: "Advanced Node.js",
    description:
      "Master backend development with Node.js, Express, databases, and API design patterns.",
    difficulty: "advanced",
    estimatedHours: 45,
    createdAt: "2024-02-01T09:15:00Z",
    updatedAt: "2024-02-01T09:15:00Z",
  },
];

function getMaxId(arr) {
  let max = 0;
  for (let i = 0; i < arr.length; i++) {
    const idNum = Number(arr[i].id);
    if (idNum > max) {
      max = idNum;
    }
  }
  return max;
}

const nextId = () => {
  const maxId = getMaxId(paths);
  return String(maxId + 1);
};

//CRUD of paths

class PathModel {
  static getAllPaths() {
    return paths;
  }

  static findById(id) {
    return paths.find((path) => path.id === id);
  }

  static createPath(pathDetails) {
    const newPath = {
      id: nextId(),
      ...pathDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    paths.push(newPath);
    return newPath;
  }

  static updatePath(id, updatedDetails) {
    const pathIndex = paths.findIndex((path) => path.id === id);
    if (pathIndex === -1) {
      return null;
    }
    const updatedPath = {
      ...paths[pathIndex],
      ...updatedDetails,
      updatedAt: new Date().toISOString(),
    };
    paths[pathIndex] = updatedPath;
    return updatedPath;
  }

  static deletePath(id) {
    const pathIndex = paths.findIndex((path) => path.id === id);
    if (pathIndex === -1) {
      return null;
    }
    const deletedPath = paths.splice(pathIndex, 1)[0];
    return deletedPath;
  }
}

module.exports = PathModel;
