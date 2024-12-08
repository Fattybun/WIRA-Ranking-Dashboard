<template>
  <div class="container">
    <h1 class="title">WIRA Ranking Dashboard</h1>
    <!-- Class Selection -->
    <div class="class-selection">
      <label>Select Class:</label>
      <select v-model="classId" class="class-select">
        <option v-for="id in classOptions" :key="id" :value="id">Class {{ id }}</option>
      </select>
    </div>
    <!-- Search Bar -->
    <input type="text" placeholder="Search by username" v-model="searchTerm" class="search-input" />
    <!-- Loading State -->
    <div v-if="loading" class="loading">Loading...</div>
    <!-- Rankings Table -->
    <table v-else class="rankings-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Username</th>
          <th>Top Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="rank in rankings" :key="`${rank.username}-${rank.class_id}`">
          <td>{{ rank.rank }}</td>
          <td>{{ rank.username }}</td>
          <td>{{ rank.top_score }}</td>
        </tr>
      </tbody>
    </table>
    <!-- Pagination -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">Previous</button>
      <span>Page {{ page }}</span>
      <button @click="nextPage" :disabled="rankings.length < 20">Next</button>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, watch, onMounted, defineComponent } from 'vue'

// Define a TypeScript interface for the ranking structure
interface Ranking {
  username: string
  class_id: number
  top_score: number
  rank: number
}

// Define the component
export default defineComponent({
  name: 'DashboardView',
  setup() {
    // Reactive variables with type annotations
    const rankings = ref<Ranking[]>([])
    const loading = ref<boolean>(false)
    const page = ref<number>(1)
    const classId = ref<number>(1)
    const searchTerm = ref<string>('')

    // Class selection options
    const classOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 8]

    // Fetch Rankings function with TypeScript typing
    const fetchRankings = async (): Promise<void> => {
      loading.value = true

      try {
        const params = new URLSearchParams({
          page: page.value.toString(),
          pageSize: '20',
          classID: classId.value.toString(),
          search: searchTerm.value,
        })

        const response = await fetch(`/api/rankings?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch rankings')
        }

        const data: Ranking[] = await response.json()
        rankings.value = data
      } catch (error) {
        console.error('Ranking fetch error:', error)
        rankings.value = []
      } finally {
        loading.value = false
      }
    }

    // Pagination Methods
    const prevPage = (): void => {
      if (page.value > 1) {
        page.value--
      }
    }

    const nextPage = (): void => {
      if (rankings.value.length === 20) {
        page.value++
      }
    }

    // Watch for changes in page, classId, or searchTerm
    watch([page, classId, searchTerm], fetchRankings)

    // Fetch data on initial load
    onMounted(fetchRankings)

    return {
      rankings,
      loading,
      page,
      classId,
      searchTerm,
      classOptions,
      prevPage,
      nextPage,
    }
  },
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.class-selection {
  margin-bottom: 1rem;
}

.class-selection label {
  margin-right: 0.5rem;
}

.class-select {
  border: 1px solid #ccc;
  padding: 0.5rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 1rem;
}

.rankings-table {
  width: 100%;
  border-collapse: collapse;
}

.rankings-table th,
.rankings-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: center;
}

.rankings-table thead {
  background-color: #f4f4f4;
}

.rankings-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.pagination button {
  padding: 0.5rem;
  border: 1px solid #ccc;
  background-color: #f4f4f4;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
