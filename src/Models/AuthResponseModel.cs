namespace sapui_study.Models
{
    public class AuthResponseModel
    {
        public string Token { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
