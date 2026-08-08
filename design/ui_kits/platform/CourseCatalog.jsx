const { CourseCard, Tabs, Badge } = window.SabiLearnDesignSystem_2075a4;

const CATALOG = [
  { title: "Intro to Data Analysis", instructor: "Chidi Okafor", level: "Beginner", price: 5000, image: "../../assets/images/studying-laptop.jpg", cat: "tech" },
  { title: "UI/UX Foundations", instructor: "Funmi Bello", level: "Intermediate", price: 7500, image: "../../assets/images/students-stairs.jpg", cat: "design" },
  { title: "Chemistry for WAEC", instructor: "Dr. Ibrahim Musa", level: "Beginner", free: true, image: "../../assets/images/vial-gloved-hand.jpg", cat: "science" },
  { title: "Organic Chemistry Lab Skills", instructor: "Dr. Ibrahim Musa", level: "Advanced", price: 6000, image: "../../assets/images/lab-vials.jpg", cat: "science" },
  { title: "Digital Marketing Basics", instructor: "Kemi Alade", level: "Beginner", free: true, image: "../../assets/images/students-stairs.jpg", cat: "business" },
  { title: "Frontend Web Development", instructor: "Tunde Bakare", level: "Intermediate", price: 8500, image: "../../assets/images/studying-laptop.jpg", cat: "tech" },
];

function CourseCatalog({ onOpenCourse }) {
  const [tab, setTab] = React.useState("all");
  const filtered = tab === "all" ? CATALOG : CATALOG.filter((c) => c.cat === tab);
  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px 32px 80px", fontFamily: "var(--font-body)" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--ink-900)", margin: "0 0 20px", letterSpacing: "var(--tracking-tight)" }}>Courses</h1>
      <div style={{ marginBottom: "28px" }}>
        <Tabs tabs={[{ label: "All", value: "all" }, { label: "Tech", value: "tech" }, { label: "Design", value: "design" }, { label: "Science", value: "science" }, { label: "Business", value: "business" }]} active={tab} onChange={setTab} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 280px)", gap: "20px" }}>
        {filtered.map((c) => (
          <div key={c.title} onClick={() => onOpenCourse(c)} style={{ cursor: "pointer" }}>
            <CourseCard image={c.image} level={c.level} title={c.title} instructor={c.instructor} price={c.price} free={c.free} />
          </div>
        ))}
      </div>
    </div>
  );
}
window.CourseCatalog = CourseCatalog;
