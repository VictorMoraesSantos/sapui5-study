namespace sapui_study.Models
{
    public class QueryFilter
    {
        public string? FilterContains { get; set; }
        public string FilterBy { get; set; } = "id";
        public string OrderBy { get; set; } = "asc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 5;
    }
}
