using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
  //localhost:5001/api/members(controllername) and in this case controller is MembersController so the name is for api/controler is api/Members so  the complete path is (removed Api controller but only keep comment now)
    public class MembersController(AppDbContext dbContext) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<AppUser>>> GetMembers()
        {
            var members = await dbContext.Users.ToListAsync();
           
            return members;
        }

        [Authorize]
        [HttpGet("{id}")]  //localhost:5001/api/members/bob-id
        public async Task<ActionResult<AppUser>> GetMember(string id)
        {
            var member = await dbContext.Users.FindAsync(id);

            if (member == null) return NotFound();

            return member;
        }
    }
}
