/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 4:43 PM
 * To change this template use File | Settings | File Templates.
 */

$data.Entity.extend('JayScrum.Settings.Repository', {
    Id: { type: $data.Integer, key: true, computed: true },
    Title: { type: $data.String, nullable: false, required: true },
    Url: { type: $data.String, nullable: false, required: true },
    UserName: { type: $data.String, nullable: true },
    Password: { type: $data.String, nullable: true },
    IsDefault: { type: $data.Boolean, nullable: true }
});
$data.EntityContext.extend('JayScrum.Settings.RepositoryContext', {
    Repositories: { type: $data.EntitySet, elementType: JayScrum.Settings.Repository }
});
