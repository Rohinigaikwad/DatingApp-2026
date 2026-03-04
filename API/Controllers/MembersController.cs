using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")] //localhost:5001/api/members(controllername) and in this case controller is MembersController so the name is for api/controler is api/Members so  the complete path is 
    [ApiController]
    public class MembersController(AppDbContext dbContext) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<AppUser>>> GetMembers()
        {
            var members = await dbContext.Users.ToListAsync();
           
            return members;
        }

        [HttpGet("{id}")]  //localhost:5001/api/members/bob-id
        public async Task<ActionResult<AppUser>> GetMember(string id)
        {
            var member = await dbContext.Users.FindAsync(id);

            if (member == null) return NotFound();

            return member;
        }
    }
}
