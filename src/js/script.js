document.addEventListener("DOMContentLoaded", () => {
  const jobList = document.getElementById("job-list");
  const keywordsInput = document.getElementById("keywords");
  const regionSelect = document.getElementById("region");
  const salaryInput = document.getElementById("salary");
  const educationSelect = document.getElementById("education");
  const experienceSelect = document.getElementById("experience");
  const employmentTypeSelect = document.getElementById("employment-type");
  const workModeSelect = document.getElementById("work-mode");
  const loadingText = document.getElementById("loading");

  // Уведомление
  const notification = document.createElement('div');
  notification.className = 'notification';
  document.body.appendChild(notification);

  let jobs = [];
  let loading = false;
  let currentPage = 1;
  const jobsPerPage = 20;

  // Загрузка вакансий из файла JSON
  function loadJobsFromFile() {
    loading = true;
    loadingText.style.display = "block";

    fetch('./data/jobs_15000.json')  // Путь к JSON-файлу
      .then(response => response.json())
      .then(data => {
        jobs = data;
        renderJobs(jobs.slice(0, jobsPerPage));
        loading = false;
        loadingText.style.display = "none";
      })
      .catch(error => {
        console.error('Error loading jobs:', error);
        loadingText.textContent = "Ошибка загрузки вакансий.";
      });
  }

  // Рендер вакансий с учетом фильтров
  function renderJobs(jobsToRender) {
    jobList.innerHTML = "";

    const filteredJobs = jobsToRender.filter(job => {
      const keywords = keywordsInput.value.toLowerCase();
      const region = regionSelect.value;
      const salary = salaryInput.value;
      const education = educationSelect.value;
      const experience = experienceSelect.value;
      const employmentType = employmentTypeSelect.value;
      const workMode = workModeSelect.value;

      // Фильтрация по ключевым словам
      if (keywords && !job.title.toLowerCase().includes(keywords)) return false;

      // Фильтрация по региону
      if (region !== "all" && job.region !== region) return false;

      // Фильтрация по уровню дохода
      if (salary && job.salary < salary) return false;

      // Фильтрация по образованию
      if (education !== "all" && job.education !== education) return false;

      // Фильтрация по опыту работы
      if (experience !== "all" && job.experience !== experience) return false;

      // Фильтрация по типу занятости
      if (employmentType !== "all" && job.employmentType !== employmentType) return false;

      // Фильтрация по рабочему режиму
      if (workMode !== "all" && job.workMode !== workMode) return false;

      return true;
    });

    filteredJobs.forEach(job => {
      const li = document.createElement("li");
      li.className = "job-item";
      li.innerHTML = `
        <h3>${job.title}</h3>
        <p><strong>Компания:</strong> ${job.company}</p>
        <p>${job.description}</p>
        <p><strong>Регион:</strong> ${job.region} | <strong>Зарплата:</strong> $${job.salary}</p>
        <button class="apply-button" data-job-id="${job.id}">Откликнуться</button>
      `;

      jobList.appendChild(li);
    });

    // Добавляем обработчики для кнопок "Откликнуться"
    document.querySelectorAll(".apply-button").forEach(button => {
      button.addEventListener("click", handleApplyClick);
    });
  }

  // Функция обработки нажатия на кнопку отклика
  function handleApplyClick(event) {
    const button = event.target;
    const jobId = button.getAttribute("data-job-id");
    const job = jobs.find(j => j.id == jobId);

    if (button.classList.contains("applied")) {
      return; // Уже откликнулись
    }

    button.classList.add("applied");
    button.textContent = "Откликнулись";

    // Показать уведомление
    showNotification(`Вы откликнулись на вакансию: ${job.title}`);
  }

  // Показать уведомление
  function showNotification(message) {
    notification.textContent = message;
    notification.style.display = "block";

    setTimeout(() => {
      notification.style.display = "none";
    }, 3000);
  }

  // Бесконечная прокрутка
  window.addEventListener("scroll", () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !loading) {
      currentPage++;
      renderJobs(jobs.slice(0, jobsPerPage * currentPage));
    }
  });

  // Обработка изменения фильтров
  const filterElements = [keywordsInput, regionSelect, salaryInput, educationSelect, experienceSelect, employmentTypeSelect, workModeSelect];
  filterElements.forEach(el => {
    el.addEventListener("input", () => {
      renderJobs(jobs.slice(0, jobsPerPage * currentPage));
    });
  });

  // Инициализация загрузки из файла
  loadJobsFromFile();
});
