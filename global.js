class IssueTracker {
  constructor() {
    // Main issue data
    this.issues = {
      1: {
        id: "1",
        title: "Improve Dashboard Navigation",
        tag: "UI/UX",
        time: "3 days ago",
        status: "new",
        description:
          "The current dashboard navigation is confusing for new users, making it difficult to locate key features and access important tools efficiently. The interface lacks clear visual hierarchy and intuitive grouping of related functions, leading to increased onboarding time and potential frustration.",
        comments: [
          {
            id: "1",
            author: "Alex Chen",
            avatar: "AC",
            time: "2 days ago",
            text: "Maybe we could add tooltips to explain navigation options?",
          },
          {
            id: "2",
            author: "Jamie Lee",
            avatar: "JL",
            time: "1 day ago",
            text: "Great idea! That would help new users a lot.",
          },
          {
            id: "3",
            author: "Taylor Wong",
            avatar: "TW",
            time: "2 days ago",
            text: "We should consider a guided tour feature for first-time users.",
          },
        ],
      },
      2: {
        id: "2",
        title: "Add Dark Mode Support",
        tag: "Feature",
        time: "5 days ago",
        status: "in-progress",
        description:
          "Many users have requested a dark mode option to reduce eye strain, particularly in low-light environments. Implementing a dark mode toggle would enhance accessibility and improve usability for extended use.",
        comments: [
          {
            id: "1",
            author: "Robin Johnson",
            avatar: "RJ",
            time: "3 days ago",
            text: "I've started working on this. Will have a prototype ready by next week.",
          },
          {
            id: "2",
            author: "Morgan Parker",
            avatar: "MP",
            time: "2 days ago",
            text: "Could we also add a system preference detection to automatically switch?",
          },
        ],
      },
      3: {
        id: "3",
        title: "Fix Search Functionality",
        tag: "Bug Report",
        time: "7 days ago",
        status: "completed",
        description:
          "The search function doesn't return results when using partial keywords or variations of a term, making it difficult for users to find relevant content efficiently. Enhancing the search algorithm to support fuzzy matching and autocomplete suggestions would greatly improve the user experience.",
        solution:
          "Implemented fuzzy search algorithm with Levenshtein distance calculation to match similar terms. Added support for partial keyword matching and improved result ranking.",
        comments: [
          {
            id: "1",
            author: "Sam Liu",
            avatar: "SL",
            time: "1 day ago",
            text: "The new search works great! Much easier to find what I need now.",
          },
        ],
      },
    }

    // Notification data - maps to main issue data
    this.notificationMap = {
      1: { issueId: "1", type: "New Comment", time: "1 hour ago" },
      2: { issueId: "2", type: "New Comment", time: "10 hours ago" },
      3: { issueId: "3", type: "Solution Proposed", time: "12 hours ago" },
      4: { issueId: "2", type: "New Comment", time: "1 day ago" },
      5: { issueId: "3", type: "New Comment", time: "2 days ago" },
      6: { issueId: "1", type: "New Comment", time: "3 days ago" },
    }

    // User preferences
    this.votedIssues = new Set(JSON.parse(localStorage.getItem("votedIssues") || "[]"))
    this.recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]")

    // App state
    this.domElements = {}
    this.isMobile = window.innerWidth <= 768
    this.currentPage = this.getCurrentPage()

    // Initialize app
    this.initDomElements()
    this.initEventListeners()
    this.initVotedIssues()
    this.initResponsiveLayout()
    this.initPageSpecificFunctionality()
  }

  // Detect current page
  getCurrentPage() {
    const path = window.location.pathname
    if (path.includes("dashboard")) return "dashboard"
    if (path.includes("profile")) return "profile"
    if (path.includes("search")) return "search"
    if (path.includes("create")) return "create"
    if (path.includes("notification")) return "notification"
    return "dashboard"
  }

  // Cache DOM elements
  initDomElements() {
    this.domElements = {
      filterTabs: document.getElementById("filter-tabs"),
      issuesList: document.getElementById("issues-list"),
      detailsContent: document.getElementById("details-content"),
      headerTitle: document.querySelector(".header-title"),
      searchInput: document.getElementById("searchInput"),
      clearSearchBtn: document.getElementById("clearSearch"),
      filterBtn: document.getElementById("filterBtn"),
      filterSidebar: document.getElementById("filterSidebar"),
      overlay: document.getElementById("overlay"),
      applyFiltersBtn: document.getElementById("applyFilters"),
      searchResults: document.getElementById("searchResults"),
      recentSearchesContainer: document.querySelector(".recent-searches"),
    }
  }

  // Setup event handlers
  initEventListeners() {
    document.addEventListener("click", this.handleEvent.bind(this))
    window.addEventListener("resize", this.handleResize.bind(this))

    if (this.currentPage === "search") {
      this.initSearchEventListeners()
    }

    if (this.currentPage === "notification") {
      this.initNotificationEventListeners()
    }
  }

  // Notification page events
  initNotificationEventListeners() {
    const tabButtons = document.querySelectorAll(".tab-button")
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        tabButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")
        this.filterNotifications(button.dataset.filter)
      })
    })

    const issueCards = document.querySelectorAll(".issue-card")
    issueCards.forEach((card) => {
      card.addEventListener("click", () => {
        issueCards.forEach((c) => c.classList.remove("selected"))
        card.classList.add("selected")
        this.showIssueDetails(card.dataset.id)
      })
    })

    // Select first notification
    const firstCard = document.querySelector(".issue-card")
    if (firstCard) {
      firstCard.classList.add("selected")
      this.showIssueDetails(firstCard.dataset.id)
    }
  }


  // Search page events
  initSearchEventListeners() {
    const { searchInput, clearSearchBtn, filterBtn, filterSidebar, overlay, applyFiltersBtn } = this.domElements

    // Search input handling
    if (searchInput) {
      searchInput.addEventListener("input", this.handleSearch.bind(this))
      searchInput.addEventListener("focus", () => {
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchInput.value ? "flex" : "none"
        }
      })
    }

    // Clear search button
    if (clearSearchBtn) {
      clearSearchBtn.style.display = "none"
      clearSearchBtn.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = ""
          clearSearchBtn.style.display = "none"
          this.hideSearchResults()
        }
      })
    }

    // Filter sidebar toggle
    if (filterBtn && filterSidebar && overlay) {
      filterBtn.addEventListener("click", () => {
        filterSidebar.classList.add("active")
        overlay.style.display = "block"
        document.body.style.overflow = "hidden"
      })

      overlay.addEventListener("click", this.closeFilterSidebar.bind(this))

      if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener("click", () => {
          this.closeFilterSidebar()
          this.applyFilters()
        })
      }
    }

    // Recent search clicks
    const recentSearchItems = document.querySelectorAll(".recent-searches li")
    recentSearchItems.forEach((item) => {
      item.addEventListener("click", () => {
        const searchText = item.querySelector("span").textContent
        if (searchInput) {
          searchInput.value = searchText
          this.handleSearch({ target: searchInput })
        }
      })
    })

    // Category selection
    const categoryButtons = document.querySelectorAll(".category-btn")
    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        categoryButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")
      })
    })
  }

  // Hide filter sidebar
  closeFilterSidebar() {
    const { filterSidebar, overlay } = this.domElements
    if (filterSidebar && overlay) {
      filterSidebar.classList.remove("active")
      overlay.style.display = "none"
      document.body.style.overflow = ""
    }
  }

  // Mark voted issues
  initVotedIssues() {
    this.votedIssues.forEach((issueId) => {
      const voteButtons = document.querySelectorAll(`.issue-card[data-id="${issueId}"] .issue-votes`)
      voteButtons.forEach((voteButton) => {
        if (voteButton) {
          voteButton.classList.add("voted")
        }
      })
    })
  }

  // Mobile adaptations
  initResponsiveLayout() {
    if (this.isMobile && this.domElements.headerTitle) {
      if (this.currentPage === "dashboard" || this.currentPage === "notification") {
        this.domElements.headerTitle.textContent = "Home"
      }
    }
  }

  // Page-specific setup
  initPageSpecificFunctionality() {
    if (this.currentPage === "dashboard") {
      const urlParams = new URLSearchParams(window.location.search)
      const filter = urlParams.get("filter") || "all"

      // Set active filter
      const tabButton = document.querySelector(`.tab-button[data-filter="${filter}"]`)
      if (tabButton) {
        this.handleTabClick(tabButton)
      }
    }

    if (this.currentPage === "profile") {
      // Activate first tab
      const firstTab = document.querySelector(".tab-btn")
      if (firstTab) {
        this.handleTabClick(firstTab)
      }
    }

    if (this.currentPage === "search") {
      // Show recent searches
      this.displayRecentSearches()
    }

    if (this.currentPage === "notification") {
      const urlParams = new URLSearchParams(window.location.search)
      const filter = urlParams.get("filter") || "unread"

      // Set active filter
      const tabButton = document.querySelector(`.tab-button[data-filter="${filter}"]`)
      if (tabButton) {
        tabButton.classList.add("active")
        this.filterNotifications(filter)
      }
    }
  }

  // Handle window resize
  handleResize() {
    const wasMobile = this.isMobile
    this.isMobile = window.innerWidth <= 768

    // Update header on breakpoint change
    if (wasMobile !== this.isMobile && this.domElements.headerTitle) {
      if (this.currentPage === "dashboard") {
        this.domElements.headerTitle.textContent = this.isMobile ? "Home" : "Dashboard"
      } else if (this.currentPage === "notification") {
        this.domElements.headerTitle.textContent = this.isMobile ? "Home" : "Notifications"
      }
    }
  }

  // Global click handler
  handleEvent(e) {
    const target = e.target
    const tabButton = target.closest(".tab-button") || target.closest(".tab-btn")
    const issueCard = target.closest(".issue-card")
    const voteButton = target.closest(".issue-votes")
    const replyButton = target.closest(".reply-button")
    const backButton = target.closest(".back-button")

    // Tab clicks
    if (tabButton) {
      e.preventDefault()
      this.handleTabClick(tabButton)
    }

    // Issue card clicks
    if (issueCard && !voteButton) {
      this.handleIssueCardClick(issueCard)
    }

    // Vote button clicks
    if (voteButton) {
      e.preventDefault()
      this.handleVoteClick(voteButton)
    }

    // Reply button clicks
    if (replyButton) {
      e.preventDefault()
      this.handleReplyClick(replyButton)
    }

    // Back button clicks
    if (backButton) {
      e.preventDefault()
      const detailsPanel = document.querySelector(".issue-details")
      if (detailsPanel) {
        detailsPanel.classList.remove("mobile-visible")
        detailsPanel.classList.remove("active")
      }
    }
  }

  // Handle tab selection
  handleTabClick(tabButton) {
    // Handle both dashboard and profile tabs
    const isProfileTab = tabButton.classList.contains("tab-btn")

    if (isProfileTab) {
      // Profile page tabs
      const allTabs = document.querySelectorAll(".tab-btn")
      allTabs.forEach((tab) => tab.classList.remove("active"))
      tabButton.classList.add("active")

      const tabId = tabButton.dataset.tab
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active")
      })
      document.getElementById(tabId).classList.add("active")
    } else {
      // Dashboard/notification tabs
      const allTabs = document.querySelectorAll(".tab-button")
      allTabs.forEach((tab) => tab.classList.remove("active"))
      tabButton.classList.add("active")

      const filter = tabButton.dataset.filter

      if (this.currentPage === "notification") {
        this.filterNotifications(filter)
      } else {
        this.filterIssues(filter)
      }

      history.pushState({}, "", `?filter=${filter}`)
    }
  }

  // Handle issue selection
  handleIssueCardClick(card) {
    // Highlight selected card
    const allCards = document.querySelectorAll(".issue-card")
    allCards.forEach((c) => c.classList.remove("selected"))
    card.classList.add("selected")

    const issueId = card.dataset.id

    // Show appropriate details
    if (this.currentPage === "notification") {
      this.showNotificationDetails(issueId)
    } else {
      this.showIssueDetails(issueId)
    }

    // Add active class to issue details panel
    const detailsPanel = document.querySelector(".issue-details")
    if (detailsPanel) {
      detailsPanel.classList.add("active")
    }

    // Mobile details panel
    if (this.isMobile) {
      if (detailsPanel) {
        detailsPanel.classList.add("mobile-visible")

        // Add close button
        if (!detailsPanel.querySelector(".mobile-close-btn")) {
          const closeBtn = document.createElement("button")
          const closeBtnClass = "mobile-close-btn"
          closeBtn.innerHTML = "×"
          closeBtn.addEventListener("click", () => {
            detailsPanel.classList.remove("mobile-visible")
            detailsPanel.classList.remove("active")
          })
          detailsPanel.appendChild(closeBtn)
          closeBtn.className = closeBtnClass
        }
      }
    }
  }

  // Handle vote toggling
  handleVoteClick(voteButton) {
    const card = voteButton.closest(".issue-card")
    const issueId = card.dataset.id

    // Get current vote count
    const countElement = voteButton.querySelector(".vote-count")
    const currentCount = Number.parseInt(countElement.textContent)

    let newCount = currentCount

    // Toggle vote state
    if (this.votedIssues.has(issueId)) {
      this.votedIssues.delete(issueId)
      newCount = currentCount - 1
    } else {
      this.votedIssues.add(issueId)
      newCount = currentCount + 1
    }

    // Update all instances
    const allCountElements = document.querySelectorAll(`.issue-card[data-id="${issueId}"] .vote-count`)
    const allVoteButtons = document.querySelectorAll(`.issue-card[data-id="${issueId}"] .issue-votes`)

    allCountElements.forEach((el) => {
      el.textContent = newCount
    })

    allVoteButtons.forEach((btn) => {
      if (this.votedIssues.has(issueId)) {
        btn.classList.add("voted")
      } else {
        btn.classList.remove("voted")
      }
    })

    // Save to localStorage
    localStorage.setItem("votedIssues", JSON.stringify([...this.votedIssues]))
  }

  // Handle reply form
  handleReplyClick(replyButton) {
    const commentEl = replyButton.closest(".comment")

    // Toggle reply form
    const existingForm = commentEl.querySelector(".reply-form")
    if (existingForm) {
      existingForm.remove()
      return
    }

    // Add reply form
    commentEl.insertAdjacentHTML(
      "beforeend",
      `
          <div class="reply-form">
              <textarea class="reply-textarea" placeholder="Write a reply..."></textarea>
              <button class="submit-reply-button">Post</button>
          </div>
        `,
    )
  }

  // Filter dashboard issues
  filterIssues(filter) {
    const issueCards = document.querySelectorAll(".issue-card")

    issueCards.forEach((card) => {
      const status = card.dataset.status

      switch (filter) {
        case "all":
          card.style.display = "flex"
          break
        case "open":
          card.style.display = status !== "completed" ? "flex" : "none"
          break
        case "solved":
          card.style.display = status === "completed" ? "flex" : "none"
          break
      }
    })
  }

  // Filter notifications
  filterNotifications(filter) {
    const issueCards = document.querySelectorAll(".issue-card");

    issueCards.forEach((card) => {
      const id = Number(card.dataset.id);

      switch (filter) {
        case "all":
          card.style.display = "flex";
          break;

        case "unread":
          if (id === 3 || id === 6) {
            card.style.display = "none";
          } else {
            card.style.display = "flex";
          }
          break;
      }
    });
  }


  // Show issue details - used for both dashboard and notifications
  showIssueDetails(issueId) {
    const issue = this.issues[issueId]
    if (!issue || !this.domElements.detailsContent) return

    const statusBadge = this.getStatusBadge(issue.status)
    const solutionHTML = issue.solution
      ? `
          <h3>Solution:</h3>
          <p class="description-text">${issue.solution}</p>
        `
      : ""

    // Generate comments HTML
    const commentsHTML =
      issue.comments && issue.comments.length > 0
        ? issue.comments
          .map(
            (comment) => `
                  <div class="comment">
                      <div class="comment-header">
                          <div class="comment-avatar">${comment.avatar}</div>
                          <div class="comment-info">
                              <div class="comment-author">${comment.author}</div>
                              <div class="comment-time">${comment.time}</div>
                          </div>
                      </div>
                      <div class="comment-text">${comment.text}</div>
                      <button class="reply-button">Reply</button>
                  </div>
                `,
          )
          .join("")
        : "<p>No comments yet.</p>"

    // Add back button for mobile on notification page
    let backButtonHTML = ""
    if (this.isMobile && this.currentPage === "notification" && !document.querySelector(".back-button")) {
      backButtonHTML = `<button class="back-button">&larr; Back</button>`
    }

    // Render details
    this.domElements.detailsContent.innerHTML = `
          ${backButtonHTML}
          <h2 class="issue-title" data-issue-id="${issueId}">${issue.title}</h2>
          <div class="issue-meta">
              <span class="tag ${issue.tag.toLowerCase().replace(/\s+/g, "-")}">${issue.tag}</span>
              <span class="tag-time">${issue.time}</span>
              ${statusBadge}
          </div>
          
          <h3>Description:</h3>
          <p class="description-text">${issue.description}</p>
          
          ${solutionHTML}
          
          <h3>Comments:</h3>
          <div class="comments-section">
              ${commentsHTML}
          </div>
        `
  }

  // Generate status badge
  getStatusBadge(status) {
    switch (status) {
      case "new":
        return '<span class="status-badge new">New</span>'
      case "in-progress":
        return '<span class="status-badge in-progress">In Progress</span>'
      case "completed":
        return '<span class="status-badge completed">Completed</span>'
      default:
        return ""
    }
  }

  // Get status color class
  getStatusClass(status) {
    switch (status) {
      case "new":
        return "red"
      case "in-progress":
        return "orange"
      case "completed":
        return "green"
      default:
        return ""
    }
  }

  // Process search input
  handleSearch(event) {
    const { clearSearchBtn } = this.domElements
    const searchTerm = event.target.value.trim().toLowerCase()

    // Toggle clear button
    if (clearSearchBtn) {
      clearSearchBtn.style.display = searchTerm ? "flex" : "none"
    }
  }

  // Hide search results
  hideSearchResults() {
    const { searchResults, recentSearchesContainer } = this.domElements
    if (searchResults && recentSearchesContainer) {
      searchResults.classList.remove("active")
      searchResults.innerHTML = ""
      recentSearchesContainer.style.display = "block"
    }
  }

  // Create issue card
  createIssueCard(issue) {
    const isVoted = this.votedIssues.has(issue.id)
    const statusClass = this.getStatusClass(issue.status)

    // Create card element
    const card = document.createElement("div")
    card.className = "issue-card"
    card.dataset.id = issue.id
    card.dataset.status = issue.status

    // Generate card HTML
    card.innerHTML = `
        <div class="issue-indicator ${statusClass}"></div>
        <div class="issue-content">
            <div class="issue-header">
                <h3 class="issue-title">${issue.title}</h3>
                <div class="issue-votes ${isVoted ? "voted" : ""}" role="button" aria-label="Vote">
                    <span class="vote-count">${this.getVoteCount(issue.id)}</span>
                    <span class="vote-arrow">▲</span>
                </div>
            </div>
            <div class="issue-tags">
                <span class="tag ${issue.tag.toLowerCase().replace(/\s+/g, "-")}">${issue.tag}</span>
                <span class="tag-time">${issue.time}</span>
            </div>
            <p class="issue-description">
                ${issue.description.substring(0, 100)}...
            </p>
        </div>
      `

    // Add vote handler
    const voteButton = card.querySelector(".issue-votes")
    voteButton.addEventListener("click", (e) => {
      e.stopPropagation()
      this.handleVoteClick(voteButton)
    })

    return card
  }

  // Get vote count
  getVoteCount(issueId) {
    const voteCounts = {
      1: 24,
      2: 18,
      3: 15,
    }
    return voteCounts[issueId] || 0
  }

  showNotificationDetails(notificationId) {
    // Get the notification metadata
    const notification = this.notificationMap[notificationId]
    if (!notification) return

    // Get the actual issue data from the main issues object
    const issueId = notification.issueId
    const issue = this.issues[issueId]
    if (!issue || !this.domElements.detailsContent) return

    // Add back button for mobile
    let backButtonHTML = ""
    if (this.isMobile && !document.querySelector(".back-button")) {
      backButtonHTML = `<button class="back-button">&larr; Back</button>`
    }

    const statusBadge = this.getStatusBadge(issue.status)
    const solutionHTML = issue.solution
      ? `
          <h3>Solution:</h3>
          <p class="description-text">${issue.solution}</p>
        `
      : ""

    // Generate comments HTML
    const commentsHTML =
      issue.comments && issue.comments.length > 0
        ? issue.comments
          .map(
            (comment) => `
                  <div class="comment">
                      <div class="comment-header">
                          <div class="comment-avatar">${comment.avatar}</div>
                          <div class="comment-info">
                              <div class="comment-author">${comment.author}</div>
                              <div class="comment-time">${comment.time}</div>
                          </div>
                      </div>
                      <div class="comment-text">${comment.text}</div>
                      <button class="reply-button">Reply</button>
                  </div>
                `,
          )
          .join("")
        : "<p>No comments yet.</p>"

    // Render details - using the same format as showIssueDetails
    this.domElements.detailsContent.innerHTML = `
        ${backButtonHTML}
        <h2 class="issue-title" data-issue-id="${issueId}">${issue.title}</h2>
        <div class="issue-meta">
            <span class="tag ${issue.tag.toLowerCase().replace(/\s+/g, "-")}">${issue.tag}</span>
            <span class="tag-time">${issue.time}</span>
            ${statusBadge}
        </div>
        
        <h3>Description:</h3>
        <p class="description-text">${issue.description}</p>
        
        ${solutionHTML}
        
        <h3>Comments:</h3>
        <div class="comments-section">
            ${commentsHTML}
        </div>
      `
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  window.tracker = new IssueTracker()
})

