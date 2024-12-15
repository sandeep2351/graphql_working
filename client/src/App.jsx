import { useState } from "react";
import "./App.css";
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_USERS = gql`
  query GetUsers {
    getUsers {
      id
      name
      age
      isMarried
    }
  }
`;

const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      id
      name
      age
      isMarried
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $age: Int!, $isMarried: Boolean!) {
    createUser(name: $name, age: $age, isMarried: $isMarried) {
      id
      name
      age
      isMarried
    }
  }
`;

function App() {
  const [newUser, setNewUser] = useState({});
  const [userId, setUserId] = useState("2"); // ID input for querying user by ID

  // Fetch all users
  const {
    data: getUsersData,
    error: getUsersError,
    loading: getUsersLoading,
  } = useQuery(GET_USERS);

  // Fetch user by ID
  const { data: getUserData, error: getUserError, loading: getUserLoading } =
    useQuery(GET_USER_BY_ID, {
      variables: { id: userId },
    });

  // Mutation to create a new user
  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }], // Refetch users after creating one
  });

  if (getUsersLoading) {
    return <p>Loading users...</p>;
  }

  if (getUsersError) {
    return <p>Error: {getUsersError.message}</p>;
  }

  const handleCreateUser = async () => {
    try {
      await createUser({
        variables: {
          name: newUser.name,
          age: Number(newUser.age),
          isMarried: false,
        },
      });
      setNewUser({}); // Clear form after user creation
    } catch (err) {
      console.error("Error creating user:", err.message);
    }
  };

  return (
    <>
      <div>
        <h2>Create a New User</h2>
        <input
          placeholder="Name"
          value={newUser.name || ""}
          onChange={(e) =>
            setNewUser((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <input
          placeholder="Age"
          type="number"
          value={newUser.age || ""}
          onChange={(e) =>
            setNewUser((prev) => ({ ...prev, age: e.target.value }))
          }
        />
        <button onClick={handleCreateUser}>Create User</button>
      </div>

      <div>
        <h2>Search User by ID</h2>
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        {getUserLoading ? (
          <p>Loading user...</p>
        ) : getUserError ? (
          <p>Error: {getUserError.message}</p>
        ) : (
          getUserData && (
            <>
              <h3>Selected User:</h3>
              <p>Name: {getUserData.getUserById.name}</p>
              <p>Age: {getUserData.getUserById.age}</p>
              <p>
                Married: {getUserData.getUserById.isMarried ? "Yes" : "No"}
              </p>
            </>
          )
        )}
      </div>

      <h1>All Users</h1>
      <div>
        {getUsersData.getUsers.map((user) => (
          <div key={user.id}>
            <p>Name: {user.name}</p>
            <p>Age: {user.age}</p>
            <p>Married: {user.isMarried ? "Yes" : "No"}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
