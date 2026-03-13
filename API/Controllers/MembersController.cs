using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
  //localhost:5001/api/members(controllername) and in this case controller is MembersController so the name is for api/controler is api/Members so  the complete path is (removed Api controller but only keep comment now)
    [Authorize]
    public class MembersController(IMemberRepository repository) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Member>>> GetMembers()
        {
           return Ok(await repository.GetMembersAsync());
        }

        [HttpGet("{id}")]  //localhost:5001/api/members/bob-id
        public async Task<ActionResult<Member>> GetMember(string id)
        {
            var member = await repository.GetMemberByIdAsync(id);

            if (member == null) return NotFound();

            return member;
        }

        [HttpGet("{id}/photos")]
        public async Task<ActionResult<IReadOnlyList<Photo>>> GetMemberPhotos(string id)
        {
            return Ok(await repository.GetPhotosForMemberAsync(id));
        }
    }
}
