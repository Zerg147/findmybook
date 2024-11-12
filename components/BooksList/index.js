import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Skeleton,
  TextField,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

const MainDiv = styled.div`
  header {
    padding: 50px;
    text-align: center;
    width: 100%;
    background-color: #ebebeb;
  }
  .main-container {
    padding: 30px;
  }
  .search-and-filters {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;

    input {
      /* padding: 10px; */
      /* width: 100%; */
    }
    .filter-btn {
      min-width: 100px;
    }
  }
  .backdrop {
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    z-index: 1;
  }
  .mobile-filters {
    position: fixed;
    height: 100%;
    top: 0;
    right: 0;
    background-color: #fff;
    z-index: 2;
    overflow-y: auto;
    /* width: unset; */
    display: flex;
    flex-direction: column;
    width: 300px;
    animation: 0.3s slideIn ease-in;
  }

  @keyframes slideIn {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(0);
    }
  }

  .active-filters {
    display: flex;
    gap: 10px;
    margin-top: 10px;

    @media screen and (max-width: 767px) {
      flex-wrap: wrap;
    }

    .active-filter {
      background-color: #ebebeb;
      padding: 4px 10px;
      border-radius: 30px;
      font-size: 12px;

      button {
        border: none;
        margin-left: 5px;
        margin-top: -2px;
        cursor: pointer;
        padding: 3px;
        transform: translateY(0px);
        font-size: 14px;
        background-color: transparent;
        &:hover {
          color: red;
        }
      }

      &.remove-all-btn {
        background-color: red;
        color: #fff;
        cursor: pointer;

        button {
          color: #fff;
        }
      }
    }
  }
  .books-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin-top: 30px;
    @media screen and (max-width: 767px) {
      grid-template-columns: repeat(2, 1fr);
    }
    .single-book {
      /* padding: 10px; */
      display: flex;
      flex-direction: column;
      gap: 5px;
      justify-content: space-between;
      background-color: #fff;
      border: 1px solid;
      .img-container {
      }

      img {
        width: 100%;
      }
      .content {
        padding: 10px;
        height: 80px;
        background-color: #ebebeb;
        overflow-y: hidden;
        .title {
          font-size: 16px;
        }
        .author {
          font-size: 14px;
        }
        @media screen and (max-width: 767px) {
          height: 90px;
          .title {
            font-size: 14px;
          }
          .author {
            font-size: 12px;
          }
        }
      }
    }
  }
  .pagination {
    display: flex;
    padding: 20px 0;
    justify-content: center;
    gap: 20px;
    a {
      cursor: pointer;
    }
  }
`;

export default function BooksList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [initialData, setInitialData] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeLang, setActiveLang] = useState([]);
  const [activeCopyright, setActiveCopyright] = useState([]);
  const [activeCategory, setActiveCategory] = useState([]);
  const [activeSort, setActiveSort] = useState("popular");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [screenWidth, setScreenWidth] = useState();
  const [filterMenu, setFilterMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchBooks = async ({
    search = "",
    copyright = [],
    languages = [],
    topic = [],
    page = 1,
    sort = "",
  } = {}) => {
    setLoading(true);
    setErrorMessage("");

    // Start constructing the URL with non-empty parameters
    let url = "https://gutendex.com/books";
    let params = [];

    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (copyright.length > 0) params.push(`copyright=${copyright}`);
    if (languages.length > 0) params.push(`languages=${languages}`);
    if (topic.length > 0) params.push(`topic=${encodeURIComponent(topic)}`);
    if (sort) params.push(`sort=${encodeURIComponent(sort)}`);
    params.push(`page=${page}`);

    url += "?" + params.join("&");

    console.log(url);

    try {
      const res = await fetch(url);
      const data = await res.json();
      setBooks(data.results);
    } catch (error) {
      setErrorMessage("Failed to fetch books.");
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchBooks({ page: currentPage });
      } catch (error) {
        console.error("Error fetching data", error.message);
      }
    };

    fetchData();
  }, [currentPage]);

  const handleSearchChange = (e) => {
    const input = e.target.value;
    setSearchTerm(input);

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      // Trim the input and check if it contains any non-space characters
      if (input.trim()) {
        fetchBooks({
          search: input.trim(), // Use the trimmed input for the search
          copyright: activeCopyright,
          languages: activeLang,
          topic: activeCategory,
          page: 1,
          sort: activeSort,
        });
      }
    }, 500);

    setTypingTimeout(timeout);
  };

  const languages = [
    { label: "English", term: "en" },
    { label: "Catalan", term: "ca" },
    { label: "French", term: "fr" },
    { label: "German", term: "de" },
    { label: "Latin", term: "la" },
    { label: "Spanish", term: "es" },
    { label: "Italian", term: "it" },
    { label: "Chinese", term: "zh" },
  ];

  const copyright = [
    { label: "Yes", term: "true" },
    { label: "No", term: "false" },
  ];

  const category = [
    { label: "Science Fiction", term: "science fiction" },
    { label: "Horror", term: "horror" },
    { label: "Romance", term: "romance" },
    { label: "Fantasy", term: "fantasy" },
    { label: "Mythology", term: "Mythology" },
  ];

  const sort = [
    { label: "Popular(default)", term: "popular" },
    { label: "Ascending", term: "ascending" },
    { label: "Descending", term: "descending" },
  ];

  const handleLanguages = (event) => {
    const { value, checked } = event.target;
    console.log(value);
    if (screenWidth < 768) {
      if (checked) {
        setActiveLang((prev) => [...prev, value]); // Add value to the array
      } else {
        setActiveLang((prev) => prev.filter((lang) => lang !== value)); // Remove value from the array
      }
    } else {
      setActiveLang(value);
    }

    fetchBooks({
      search: searchTerm,
      copyright: activeCopyright,
      languages: value,
      topic: activeCategory,
      page: currentPage,
      sort: activeSort,
    });
  };

  const handleCopyright = (event) => {
    const { value, checked } = event.target;
    console.log(value);
    if (screenWidth < 768) {
      if (checked) {
        setActiveCopyright((prev) => [...prev, value]); // Add value to the array
      } else {
        setActiveCopyright((prev) => prev.filter((lang) => lang !== value)); // Remove value from the array
      }
    } else {
      setActiveCopyright(value);
    }
    fetchBooks({
      search: searchTerm,
      copyright: value,
      languages: activeLang,
      topic: activeCategory,
      page: currentPage,
      sort: activeSort,
    });
  };

  const handleCategory = (event) => {
    const { value, checked } = event.target;
    console.log(value);
    if (screenWidth < 768) {
      if (checked) {
        setActiveCategory((prev) => [...prev, value]); // Add value to the array
      } else {
        setActiveCategory((prev) => prev.filter((lang) => lang !== value)); // Remove value from the array
      }
    } else {
      setActiveCategory(value);
    }
    fetchBooks({
      search: searchTerm,
      copyright: activeCopyright,
      languages: activeLang,
      topic: value,
      page: currentPage,
      sort: activeSort,
    });
  };

  const handleSort = (event) => {
    const { value } = event.target;
    setActiveSort(value);
    fetchBooks({
      search: searchTerm,
      copyright: activeCopyright,
      languages: activeLang,
      topic: activeCategory,
      page: currentPage,
      sort: value,
    });
  };

  const getLabelFromTerm = (term, list) => {
    const item = list.find((i) => i.term === term);
    return item ? item.label : term; // If not found, return the term
  };

  const removeFilter = (filter, target) => {
    if (filter === "search") {
      setSearchTerm("");
      fetchBooks({
        search: "",
        copyright: activeCopyright,
        languages: activeLang,
        topic: activeCategory,
        page: 1,
        sort: activeSort,
      });
    } else if (filter === "language") {
      const updatedLangs = activeLang.filter((lang) => lang !== target);
      setActiveLang(updatedLangs);
      fetchBooks({
        search: searchTerm,
        copyright: activeCopyright,
        languages: updatedLangs,
        topic: activeCategory,
        page: 1,
        sort: activeSort,
      });
    } else if (filter === "copyright") {
      const updatedCopyright = activeCopyright.filter(
        (item) => item !== target
      );
      setActiveCopyright(updatedCopyright);
      fetchBooks({
        search: searchTerm,
        copyright: updatedCopyright,
        languages: activeLang,
        topic: activeCategory,
        page: 1,
        sort: activeSort,
      });
    } else if (filter === "category") {
      const updatedCategory = activeCategory.filter((cat) => cat !== target);
      setActiveCategory(updatedCategory);
      fetchBooks({
        search: searchTerm,
        copyright: activeCopyright,
        languages: activeLang,
        topic: updatedCategory,
        page: 1,
        sort: activeSort,
      });
    } else if (filter === "removeAll") {
      setSearchTerm("");
      setActiveLang([]);
      setActiveCopyright([]);
      setActiveCategory([]);
      fetchBooks({
        search: "",
        copyright: [],
        languages: [],
        topic: [],
        page: 1,
        sort: "",
      });
    }
  };

  return (
    <MainDiv>
      <header>
        <h1 className="main-heading">Find Your Book!</h1>
        <h2 className="sub-heading">For the Geeks, by the Geeks.</h2>
      </header>
      <div className="main-container">
        <div className="search-and-filters">
          {/* <input
            type="search"
            placeholder="Search for books"
            value={searchTerm}
            onChange={handleSearchChange}
          /> */}

          {screenWidth >= 768 && (
            <>
              <FormControl sx={{ width: 250 }}>
                <TextField
                  id="outlined-basic"
                  label="Search for books"
                  variant="outlined"
                  type="search"
                  placeholder="Search for books"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </FormControl>
              <FormControl sx={{ width: 250 }}>
                <InputLabel>Languages</InputLabel>
                <Select
                  multiple
                  value={activeLang}
                  onChange={handleLanguages}
                  input={<OutlinedInput label="Languages" />}
                  renderValue={(selected) =>
                    selected
                      .map((term) => getLabelFromTerm(term, languages))
                      .join(", ")
                  }
                  placeholder="Languages"
                >
                  {languages.map((item) => (
                    <MenuItem key={item.term} value={item.term}>
                      <Checkbox checked={activeLang.includes(item.term)} />
                      <ListItemText primary={item.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ width: 250 }}>
                <InputLabel>Copyright</InputLabel>
                <Select
                  multiple
                  value={activeCopyright}
                  onChange={handleCopyright}
                  input={<OutlinedInput label="Copyright" />}
                  renderValue={(selected) =>
                    selected
                      .map((term) => getLabelFromTerm(term, copyright))
                      .join(", ")
                  }
                >
                  {copyright.map((item) => (
                    <MenuItem key={item.term} value={item.term}>
                      <Checkbox checked={activeCopyright.includes(item.term)} />
                      <ListItemText primary={item.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ width: 250 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  multiple
                  value={activeCategory}
                  onChange={handleCategory}
                  input={<OutlinedInput label="Category" />}
                  renderValue={(selected) =>
                    selected
                      .map((term) => getLabelFromTerm(term, copyright))
                      .join(", ")
                  }
                >
                  {category.map((item) => (
                    <MenuItem key={item.term} value={item.term}>
                      <Checkbox checked={activeCategory.includes(item.term)} />
                      <ListItemText primary={item.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ width: 250 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={activeSort}
                  onChange={handleSort}
                  input={<OutlinedInput label="Sort By" />}
                  renderValue={(selected) =>
                    sort.find((i) => i.term === selected).label
                  }
                >
                  {sort.map((item) => (
                    <MenuItem key={item.term} value={item.term}>
                      <Checkbox checked={activeSort.includes(item.term)} />
                      <ListItemText primary={item.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          {screenWidth < 768 && (
            <>
              <FormControl sx={{ width: 3000 }}>
                <TextField
                  id="outlined-basic"
                  label="Search for books"
                  variant="outlined"
                  type="search"
                  placeholder="Search for books"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterMenu(true)}
              >
                Filters
              </Button>
            </>
          )}
        </div>
        <div className="active-filters">
          {searchTerm && (
            <div className="active-filter">
              {searchTerm}
              <button onClick={() => removeFilter("search")}>x</button>
            </div>
          )}
          {activeLang.length > 0 &&
            activeLang?.map((item) => (
              <div className="active-filter">
                {getLabelFromTerm(item, languages)}
                <button onClick={() => removeFilter("language", item)}>
                  x
                </button>
              </div>
            ))}
          {activeCopyright.length > 0 &&
            activeCopyright?.map((item) => (
              <div className="active-filter">
                Copyright: {getLabelFromTerm(item, copyright)}
                <button onClick={() => removeFilter("copyright", item)}>
                  x
                </button>
              </div>
            ))}
          {activeCategory.length > 0 &&
            activeCategory?.map((item) => (
              <div className="active-filter">
                {getLabelFromTerm(item, category)}
                <button onClick={() => removeFilter("category", item)}>
                  x
                </button>
              </div>
            ))}
          {(searchTerm ||
            activeLang.length > 0 ||
            activeCopyright.length > 0 ||
            activeCategory.length > 0) && (
            <div
              className="active-filter remove-all-btn"
              onClick={() => removeFilter("removeAll")}
            >
              Remove All
              <button>{">"}</button>
            </div>
          )}
        </div>
        {errorMessage && <div>{errorMessage}</div>}
        <div className="books-grid">
          {loading ? (
            <>
              <Skeleton variant="rectangular" width={"100%"} height={500} />
              <Skeleton variant="rectangular" width={"100%"} height={500} />
              <Skeleton variant="rectangular" width={"100%"} height={500} />
              <Skeleton variant="rectangular" width={"100%"} height={500} />
              <Skeleton variant="rectangular" width={"100%"} height={500} />
            </>
          ) : books.length > 0 ? (
            books?.map((book) => (
              <div key={book.id} className="single-book">
                <div className="img-container">
                  {book.formats["image/jpeg"] && (
                    <img
                      src={book.formats["image/jpeg"]}
                      alt={`${book.title} cover`}
                      className="book-cover"
                    />
                  )}
                </div>
                <div className="content">
                  <h3 className="title">{book.title}</h3>
                  {book.authors.length > 0 && (
                    <p className="author">by {book.authors[0].name}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <h3>No Results Found</h3>
          )}
        </div>
        <div className="pagination">
          {currentPage > 1 && (
            <a onClick={() => setCurrentPage(currentPage - 1)}>&lt; Previous</a>
          )}
          <a onClick={() => setCurrentPage(currentPage + 1)}>Next &gt;</a>
        </div>
      </div>
      {screenWidth < 768 && (
        <>
          {filterMenu && (
            <>
              <div
                className="backdrop"
                onClick={() => setFilterMenu(false)}
              ></div>
              <div className="mobile-filters">
                <FormControl
                  sx={{ m: 3 }}
                  component="fieldset"
                  variant="standard"
                >
                  <FormLabel component="legend">Languages</FormLabel>
                  <FormGroup>
                    {languages.map((item) => (
                      <FormControlLabel
                        key={item.term}
                        value={item.term}
                        control={
                          <Checkbox
                            onChange={handleLanguages}
                            checked={activeLang.includes(item.term)}
                          />
                        }
                        label={item.label}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
                <FormControl
                  sx={{ m: 3 }}
                  component="fieldset"
                  variant="standard"
                >
                  <FormLabel component="legend">Copyright</FormLabel>
                  <FormGroup>
                    {copyright.map((item) => (
                      <FormControlLabel
                        key={item.term}
                        value={item.term}
                        control={
                          <Checkbox
                            onChange={handleCopyright}
                            checked={activeCopyright.includes(item.term)}
                          />
                        }
                        label={item.label}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
                <FormControl
                  sx={{ m: 3 }}
                  component="fieldset"
                  variant="standard"
                >
                  <FormLabel component="legend">Category</FormLabel>
                  <FormGroup>
                    {category.map((item) => (
                      <FormControlLabel
                        key={item.term}
                        value={item.term}
                        control={
                          <Checkbox
                            onChange={handleCategory}
                            checked={activeCategory.includes(item.term)}
                          />
                        }
                        label={item.label}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
                <FormControl
                  sx={{ m: 3 }}
                  component="fieldset"
                  variant="standard"
                >
                  <FormLabel component="legend">Sort by</FormLabel>
                  <Select
                    value={activeSort}
                    onChange={handleSort}
                    renderValue={(selected) =>
                      sort.find((i) => i.term === selected).label
                    }
                  >
                    {sort.map((item) => (
                      <MenuItem key={item.term} value={item.term}>
                        <Checkbox checked={activeSort.includes(item.term)} />
                        <ListItemText primary={item.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </>
          )}
        </>
      )}
    </MainDiv>
  );
}

// export async function getServerSideProps(context) {
//     console.log("Fetching data..."); // Confirm entry into the function
//     const page = context.query.page || 1;

//     try {
//         const res = await fetch(`https://gutendex.com/books/?page=${page}`);
//         if (!res.ok) throw new Error("Failed to fetch data");

//         const data = await res.json();
//         console.log("Fetched data:", data); // Log the fetched data

//         return {
//             props: {
//                 books: data.results || [],
//                 currentPage: Number(page),
//             },
//         };
//     } catch (error) {
//         console.error("Error in getServerSideProps:", error.message);
//         return {
//             props: {
//                 books: [],
//                 currentPage: Number(page),
//             },
//         };
//     }
// }
