const cardContents = document.querySelector(".card-contents");
const filterTitle = document.querySelector(".filterTitle");
const filterLocation = document.querySelector(".filterLocation");
const searchBtn = document.querySelector(".searchBtn");
const smSearchBtn = document.querySelector(".smSearchBtn");
const searchBtnModal = document.querySelector(".searchBtnModal");
const checkbox = document.querySelector(".checkbox");
const checkboxModal = document.querySelector(".checkboxModal");
const container = document.querySelector(".container");
const footer = document.querySelector(".footer");
const themeChange = document.querySelector(".switch");
const inputParts = document.querySelector(".inputParts");
const checkboxLabel = document.querySelector(".checkboxLabel");
const filterLocationModal = document.querySelector(".filterLocationModal");
const modal = document.querySelector(".modal");
const filterBtn = document.querySelector(".filterBtn");

// * modal ekran büyükse gizle
window.addEventListener("resize", function () {
  if (window.innerWidth >= 768) {
    modal.style.display = "none";
  }
});

// * ekran küçülünce çıkan filter butonuna tıklanınca modal'ın gözükmesi için
filterBtn.addEventListener("click", (e) => {
  e.preventDefault();
  modal.style = "display: flex";
});

// * search butonlarının içeriği
function handleSubmit(e) {
  e.preventDefault();
  modal.style = "display: none";
  init({
    fTitle: filterTitle.value.toLocaleLowerCase("tr"),
    fLocation: filterLocation.value.toLocaleLowerCase("tr"),
    fLocationModal: filterLocationModal.value.toLocaleLowerCase("tr"),
    fullTimeOnly: checkbox.checked,
    fullTimeOnlyModal: checkboxModal.checked,
  });
}

// * search butonları etkileşimleri
searchBtn.addEventListener("click", handleSubmit);
searchBtnModal.addEventListener("click", handleSubmit);
smSearchBtn.addEventListener("click", handleSubmit);

// * render
async function init({ fTitle = "", fLocation = "", fLocationModal = "", fullTimeOnly = false, fullTimeOnlyModal = false }) {
  // * sıfırlama
  filterLocation.innerHTML = '<option value="">Filter by location</option>';
  filterLocationModal.innerHTML = '<option value="">Filter by location</option>';
  cardContents.innerHTML = "";

  // * fetch işlemi
  const response = await fetch("/assets/json/data.json").then((x) => x.json());

  // * select inputuna option ekleme ve aynı şehirleri eklememek için kontrolcü işlemi
  let countries = [];
  response.forEach((element) => {
    if (!countries.includes(element.location)) {
      filterLocation.innerHTML += `<option value="${element.location}">${element.location}</option>`;
      filterLocationModal.innerHTML += `<option value="${element.location}">${element.location}</option>`;
      countries.push(element.location);
    }
  });

  // * filtreleme işlemi
  response
    .filter((x) => x.position.toLocaleLowerCase("tr").includes(fTitle) || x.company.toLocaleLowerCase("tr").includes(fTitle))
    .filter((x) => x.location.toLocaleLowerCase("tr").includes(fLocation))
    .filter((x) => x.location.toLocaleLowerCase("tr").includes(fLocationModal))
    .filter((x) => (fullTimeOnly || fullTimeOnlyModal ? x.contract.includes("Full Time") : true))
    .map((item) => {
      const { location, logo, contract, position, company, postedAt, id } = item;
      cardContents.innerHTML += `
        <div class="card ${themeChange.checked ? "dark-mode" : ""}">
          <img src="${logo}" alt="">
          <span class="metadata">${postedAt} . ${contract}</span>
          <h2 class="jobPosition" data-id="${id}">${position}</h2>
          <span class="company">${company}</span>
          <span class="country">${location}</span>
        </div>
      `;
    });

  return response;
}

// * dark mode işlemi
function darkMode() {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.classList.toggle("dark-mode");
  });

  const jobDetails = document.querySelector(".jobDetails");
  if (jobDetails != null) {
    jobDetails.classList.toggle("dark-mode");
  }
  document.body.classList.toggle("dark-mode");
  inputParts.classList.toggle("dark-mode");
  checkboxLabel.classList.toggle("dark-mode");
  filterLocation.classList.toggle("dark-mode");
  footer.classList.toggle("dark-mode");
  modal.classList.toggle("dark-mode");
  themeChange.checked ? localStorage.setItem("darkmode", "true") : localStorage.setItem("darkmode", "false");
}

init({}).then((response) => {
  // * localstorage darkmode kontrolü. eğer darkmode true ise darkmode u çalıştır.
  const darkModeStorage = localStorage.getItem("darkmode");
  if (darkModeStorage === "true") {
    themeChange.checked = true;
    darkMode();
  }

  // * iş ilanı detayının yazdırılması
  const jobPositions = document.querySelectorAll(".jobPosition");
  jobPositions.forEach((button) => {
    button.addEventListener("click", function () {
      window.scrollTo(0, 0); // * Ekranın en üste gelmesi için
      const dataId = this.getAttribute("data-id"); // * tıklanılan ilanının data-id değerinin alınması
      const jobData = response.find((x) => x.id == dataId); // * response içinden istenilen ilanın bulunması
      const { location, logo, contract, position, company, postedAt, website, description, requirements, role } = jobData;
      container.innerHTML = `
      <div class="jobDetails${themeChange.checked ? " dark-mode" : ""}">
        <div class="top-content">
          <div class="job-logo"><img src="${logo}" alt="" /></div>
          <div class="company-text">
            <span class="companyName">${company}</span>
            <span class="companySite">${website}</span>
          </div>
          <button class="companyBtn">Company Site</button>
        </div>
        <div class="bottom-content">
          <div class="bottom-header">
            <div class="header-text">
              <span class="topText">${postedAt} . ${contract}</span>
              <h2 class="jobTitle">${position}</h2>
              <span class="jobLocation">${location}</span>
            </div>
            <button class="applyNowBtn">Apply Now</button>
          </div>

          <div class="jobExplanation">
            <p class="jobDescription">${description}</p>
            <h3 class="jobRequirements">Requirements</h3>
            <p class="jobRequirementsText">${requirements.content}</p>
            <ul class="jobRequirementsList">
              ${requirements.items.map((x) => `<li>${x}</li>`).join("")}
            </ul>
            <h3 class="jobWhatYouWillDo">What You Will Do</h3>
            <p class="jobWhatYouWillDoText">${role.content}</p>
            <ol class="jobWhatYouWillDoList">
              ${role.items.map((x) => `<li>${x}</li>`).join("")}
            </ol>
          </div>
        </div>
      </div>
      `;

      footer.classList.remove("hidden");
    });
  });
});

//tıklama eventi ile dark mode çalışır.
themeChange.addEventListener("click", darkMode);