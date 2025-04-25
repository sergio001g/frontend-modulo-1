$(document).ready(() => {
  // Variables globales
  let tasks = JSON.parse(localStorage.getItem("tasks")) || []
  const timers = {}

  // Funciones auxiliares
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

  const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
    updateStats()
  }

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  // Crear elemento de tarea
  const createTaskElement = (task) => {
    const $taskItem = $("<li>")
      .addClass(`task-item ${task.priority}`)
      .attr("data-id", task.id)
      .html(`
                <div class="task-content">
                    <div class="task-header">
                        <select class="priority-select">
                            <option value="low" ${task.priority === "low" ? "selected" : ""}>Baja</option>
                            <option value="normal" ${task.priority === "normal" ? "selected" : ""}>Normal</option>
                            <option value="high" ${task.priority === "high" ? "selected" : ""}>Alta</option>
                        </select>
                        <span class="badge ${task.priority}">${task.priority === "high" ? "Alta" : task.priority === "normal" ? "Normal" : "Baja"}</span>
                        <span class="timer">${formatTime(task.timeSpent || 0)}</span>
                    </div>
                    <p class="task-text">${task.text}</p>
                </div>
                <div class="task-actions">
                    <button class="timer-btn tooltip" title="Iniciar/Detener temporizador">
                        <i class="fas fa-clock"></i>
                        <span class="tooltiptext">Temporizador</span>
                    </button>
                    <button class="complete-btn tooltip" title="Marcar como ${task.completed ? "pendiente" : "completada"}">
                        <i class="fas ${task.completed ? "fa-undo" : "fa-check"}"></i>
                        <span class="tooltiptext">${task.completed ? "Desmarcar" : "Completar"}</span>
                    </button>
                    <button class="delete-btn tooltip" title="Eliminar tarea">
                        <i class="fas fa-trash"></i>
                        <span class="tooltiptext">Eliminar</span>
                    </button>
                </div>
            `)

    return $taskItem
  }

  // Renderizar tareas
  const renderTasks = () => {
    const $activeTaskList = $("#taskList").empty()
    const $completedTaskList = $("#completedTaskList").empty()
    const filterStatus = $("#filterStatus").val()
    const filterPriority = $("#filterPriority").val()

    // Filtrar tareas
    const filteredTasks = tasks.filter((task) => {
      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "active" && !task.completed) ||
        (filterStatus === "completed" && task.completed)
      const priorityMatch = filterPriority === "all" || task.priority === filterPriority
      return statusMatch && priorityMatch
    })

    // Mostrar mensaje si no hay tareas
    if (filteredTasks.length === 0) {
      const $emptyState = $('<div class="empty-state">').html(`
                    <i class="fas fa-tasks"></i>
                    <p>No hay tareas que mostrar</p>
                `)

      if (filterStatus === "all" && filterPriority === "all") {
        $activeTaskList.append($emptyState.clone())
      } else if (filterStatus === "active" || filterStatus === "all") {
        $activeTaskList.append($emptyState.clone())
      }

      if (filterStatus === "completed" || filterStatus === "all") {
        $completedTaskList.append($emptyState.clone())
      }
    } else {
      // Agregar tareas a las listas correspondientes
      filteredTasks.forEach((task) => {
        const $taskElement = createTaskElement(task)
        if (task.completed) {
          $completedTaskList.append($taskElement)
        } else {
          $activeTaskList.append($taskElement)
        }
      })
    }

    // Iniciar temporizadores activos
    Object.keys(timers).forEach((taskId) => {
      $(`.timer-btn[data-id="${taskId}"]`).addClass("active")
    })

    // Hacer las listas ordenables
    $activeTaskList.sortable({
      items: ".task-item",
      handle: ".task-content",
      connectWith: "#completedTaskList",
      update: () => {
        updateTaskOrder()
      },
    })

    $completedTaskList.sortable({
      items: ".task-item",
      handle: ".task-content",
      connectWith: "#taskList",
      update: () => {
        updateTaskOrder()
      },
    })
  }

  // Actualizar orden de tareas
  const updateTaskOrder = () => {
    const newTasks = []

    // Obtener tareas activas
    $("#taskList .task-item").each(function () {
      const taskId = $(this).data("id")
      const task = tasks.find((t) => t.id === taskId)
      if (task) {
        task.completed = false
        newTasks.push(task)
      }
    })

    // Obtener tareas completadas
    $("#completedTaskList .task-item").each(function () {
      const taskId = $(this).data("id")
      const task = tasks.find((t) => t.id === taskId)
      if (task) {
        task.completed = true
        newTasks.push(task)
      }
    })

    tasks = newTasks
    saveTasks()
  }

  // Actualizar estadísticas
  const updateStats = () => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const active = total - completed

    $("#totalTasks").text(`Total: ${total}`)
    $("#completedTasks").text(`Completadas: ${completed}`)
    $("#activeTasks").text(`Activas: ${active}`)
  }

  // Agregar nueva tarea
  $("#addTask").on("click", () => {
    const $input = $("#taskInput")
    const text = $input.val().trim()

    if (text) {
      const newTask = {
        id: generateId(),
        text: text,
        completed: false,
        priority: "normal",
        timeSpent: 0,
        createdAt: Date.now(),
      }

      tasks.push(newTask)
      saveTasks()
      renderTasks()
      $input.val("").focus()

      // Animar la nueva tarea
      const $newTask = $(`.task-item[data-id="${newTask.id}"]`)
      $newTask.hide().slideDown(300)
    }
  })

  // Agregar tarea con Enter
  $("#taskInput").on("keypress", (e) => {
    if (e.which === 13) {
      $("#addTask").click()
    }
  })

  // Efecto de foco en el input
  $("#taskInput")
    .on("focus", function () {
      $(this).parent().addClass("focused")
    })
    .on("blur", function () {
      $(this).parent().removeClass("focused")
    })

  // Marcar tarea como completada
  $(document).on("click", ".complete-btn", function () {
    const $taskItem = $(this).closest(".task-item")
    const taskId = $taskItem.data("id")
    const task = tasks.find((t) => t.id === taskId)

    if (task) {
      task.completed = !task.completed

      // Detener temporizador si está activo
      if (timers[taskId]) {
        clearInterval(timers[taskId])
        delete timers[taskId]
        $(this).siblings(".timer-btn").removeClass("active")
      }

      // Animar y mover la tarea
      $taskItem.addClass("task-complete-animation")
      setTimeout(() => {
        saveTasks()
        renderTasks()
      }, 800)
    }
  })

  // Eliminar tarea
  $(document).on("click", ".delete-btn", function () {
    const $taskItem = $(this).closest(".task-item")
    const taskId = $taskItem.data("id")

    // Detener temporizador si está activo
    if (timers[taskId]) {
      clearInterval(timers[taskId])
      delete timers[taskId]
    }

    // Animar y eliminar la tarea
    $taskItem.slideUp(300, () => {
      tasks = tasks.filter((t) => t.id !== taskId)
      saveTasks()
      renderTasks()
    })
  })

  // Cambiar prioridad de tarea
  $(document).on("change", ".priority-select", function () {
    const $taskItem = $(this).closest(".task-item")
    const taskId = $taskItem.data("id")
    const newPriority = $(this).val()
    const task = tasks.find((t) => t.id === taskId)

    if (task) {
      task.priority = newPriority
      saveTasks()

      // Actualizar clase y badge
      $taskItem.removeClass("low normal high").addClass(newPriority)
      $taskItem
        .find(".badge")
        .removeClass("low normal high")
        .addClass(newPriority)
        .text(newPriority === "high" ? "Alta" : newPriority === "normal" ? "Normal" : "Baja")
    }
  })

  // Iniciar/detener temporizador
  $(document).on("click", ".timer-btn", function () {
    const $taskItem = $(this).closest(".task-item")
    const taskId = $taskItem.data("id")
    const $timer = $taskItem.find(".timer")
    const task = tasks.find((t) => t.id === taskId)

    if (!task || task.completed) return

    if (timers[taskId]) {
      // Detener temporizador
      clearInterval(timers[taskId])
      delete timers[taskId]
      $(this).removeClass("active")
    } else {
      // Iniciar temporizador
      $(this).addClass("active")
      let seconds = task.timeSpent || 0
      timers[taskId] = setInterval(() => {
        seconds++
        task.timeSpent = seconds
        $timer.text(formatTime(seconds))
        saveTasks()
      }, 1000)
    }
  })

  // Filtrar tareas
  $("#filterStatus, #filterPriority").on("change", renderTasks)

  // Inicializar
  renderTasks()
})
